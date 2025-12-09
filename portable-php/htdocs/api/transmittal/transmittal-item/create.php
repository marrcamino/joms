<?php
require_once __DIR__ . '/../../helpers.php';

try {
  $db = getDatabase();
  $db->beginTransaction();

  if (is_missing($_GET, 'transmittal_fk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing or transmittal_fk'
    ]);
    exit;
  }

  $input = json_decode(file_get_contents('php://input'), true);
  $transmittal_fk = $_GET['transmittal_fk'];

  // Insert to transmittal_item table
  $stmt = $db->prepare("
      INSERT INTO transmittal_item (
        transmittal_fk, fund_charge, num_of_days  
      ) VALUES (
        :transmittal_fk, :fund_charge, :num_of_days
      )
  ");

  $stmt->bindValue(':transmittal_fk', $transmittal_fk);
  $stmt->bindValue(':fund_charge', $input['fund_charge']);
  $stmt->bindValue(':num_of_days', $input['num_of_days']);
  $stmt->execute();
  $transmittal_item_pk = (int)$db->lastInsertId();

  // Insert to contract table
  $stmt = $db->prepare("
      INSERT INTO contract (
        employee_fk, 
        start_date, 
        end_date,
        designation,
        rate,
        office_fk,
        position_category_fk,
        remarks,
        source_type,
        transmittal_item_fk
      ) 
      VALUES (
        :employee_fk, 
        :start_date, 
        :end_date,
        :designation,
        :rate,
        :office_fk,
        :position_category_fk,
        :remarks,
        :source_type,
        :transmittal_item_fk
      )
  ");
  $stmt->bindValue(':employee_fk', $input['employee_fk']);
  $stmt->bindValue(':start_date', $input['start_date']);
  $stmt->bindValue(':end_date', $input['end_date']);
  $stmt->bindValue(':designation', $input['designation']);
  $stmt->bindValue(':rate', $input['rate']);
  $stmt->bindValue(':office_fk', $input['office_fk']);
  $stmt->bindValue(':position_category_fk', $input['position_category_fk']);
  $stmt->bindValue(':remarks', null);
  $stmt->bindValue(':source_type', 'transmittal');
  $stmt->bindValue(':transmittal_item_fk', $transmittal_item_pk);
  $stmt->execute();

  syncTransmittalFromContracts($db, $transmittal_fk);

  // Getting data from views
  $stmt = $db->prepare("SELECT * FROM v_transmittal_contract_items WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt->execute([":transmittal_item_pk" =>  $transmittal_item_pk]);
  $transmittals = $stmt->fetch(PDO::FETCH_ASSOC);

  $db->commit();
  echo json_encode($transmittals);
} catch (PDOException $e) {
  if ($db->inTransaction()) $db->rollBack();
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to insert trasnmittal item: ' . $e->getMessage()
  ]);
}
