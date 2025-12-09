<?php
require_once __DIR__ . '/../../helpers.php';

try {
  $db = getDatabase();
  $db->beginTransaction();

  $input = json_decode(file_get_contents('php://input'), true);

  // Validate required fields
  if (is_missing($_GET['office_pk'])) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing or invalid transmittals array'
    ]);
    exit;
  }

  // Transmittal Table
  $stmt1 = $db->prepare("
     INSERT INTO transmittal (office_fk, start_date, end_date, funding_charge, remarks) 
     VALUES (:office_fk, :start_date, :end_date, :funding_charge, :remarks)
   ");

  $stmt1->execute([
    ":office_fk" =>  $_GET['office_pk'],
    ":start_date" =>  $input['start_date'],
    ":end_date" =>  $input['end_date'],
    ":funding_charge" =>  $input['funding_charge'],
    ":remarks" =>  $input['remarks'] ?? null,
  ]);
  $transmittal_pk = (int)$db->lastInsertId();

  $contracts = [];
  // Transmittal Item Table
  $stmt2 = $db->prepare("INSERT INTO transmittal_item (transmittal_fk, fund_charge, num_of_days) VALUES (:transmittal_fk, :fund_charge, :num_of_days)");
  foreach ($input['transmittals'] as $t) {
    $stmt2->execute([
      ':transmittal_fk' => $transmittal_pk,
      ':fund_charge' => $t['fund_charge'],
      ':num_of_days' => $t['num_of_days']
    ]);

    $contracts[] = [
      "employee_fk" => $t['employee_fk'],
      "start_date" => $t['start_date'],
      "end_date" => $t['end_date'],
      "designation" => $t['designation'],
      "rate" => $t['rate'],
      "office_fk" => $t['office_fk'],
      "transmittal_item_fk" => (int)$db->lastInsertId()
    ];
  }

  // Contracts Table
  $stmt3 = $db->prepare("
      INSERT INTO contract (
        employee_fk, start_date, end_date, designation, rate, office_fk, source_type, transmittal_item_fk
      ) VALUES (
       :employee_fk, :start_date, :end_date, :designation, :rate, :office_fk, :source_type, :transmittal_item_fk
      )
   ");

  foreach ($contracts as $c) {
    $stmt3->execute([
      ':employee_fk' => (int)$c['employee_fk'],
      ':start_date' => $c['start_date'],
      ':end_date' => $c['end_date'],
      ':designation' => $c['designation'],
      ':rate' => $c['rate'],
      ':office_fk' => (int)$c['office_fk'],
      ':source_type' => 'transmittal',
      ':transmittal_item_fk' => (int)$c['transmittal_item_fk']
    ]);
  }


  $db->commit();

  echo json_encode([
    'status' => 'success',
    'transmittal_pk' => $transmittal_pk,
  ]);
} catch (PDOException $e) {
  // Rollback if anything failed
  if ($db->inTransaction()) $db->rollBack();
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to insert transmittal: ' . $e->getMessage()]);
}
