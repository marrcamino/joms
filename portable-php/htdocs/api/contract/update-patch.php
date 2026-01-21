<?php
require_once __DIR__ . '/../helpers.php';

// THIS ROUTE CURRENTLY USED FOR:
// Updating contract where the source_type is transmittal
// Use this route with cautions

// This route is currently allowed updating transmittal_item where this item is the only in its transmittal
try {
  if (is_missing($_GET, 'contract_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing contract_pk'
    ]);
    exit;
  }

  $db = getDatabase();
  $db->beginTransaction();

  $input = json_decode(file_get_contents('php://input'), true);
  $contract_pk = (int)$_GET['contract_pk'];

  $stmt = $db->prepare("
    UPDATE contract 
    SET designation = :designation, 
      rate = :rate, 
      appointment_status = :appointment_status 
    WHERE contract_pk = :contract_pk
    ");
  $stmt->bindValue(':designation', $input['designation']);
  $stmt->bindValue(':rate', $input['rate']);
  $stmt->bindValue(':appointment_status', $input['appointment_status']);
  $stmt->bindValue(':contract_pk', $contract_pk);
  $stmt->execute();


  // UPDATING TRANSMITTAL APPOINTMENT STATUS
  // Get transmittal id
  $stmt = $db->prepare("
    SELECT t.transmittal_pk
    FROM contract c
    JOIN transmittal_item ti
      ON c.transmittal_item_fk = ti.transmittal_item_pk
    JOIN transmittal t
      ON ti.transmittal_fk = t.transmittal_pk
    WHERE c.contract_pk = :contract_pk
      AND c.source_type = 'transmittal';
    ");

  $stmt->execute(['contract_pk' => $contract_pk]);
  $transmittal_pk = $stmt->fetch(PDO::FETCH_ASSOC)['transmittal_pk'];

  // Update transmital's appointment status
  $stmt = $db->prepare("
     UPDATE transmittal 
     SET appointment_status = :appointment_status
     WHERE transmittal_pk = :transmittal_pk
  ");
  $stmt->bindValue(':appointment_status', $input['appointment_status']);
  $stmt->bindValue(':transmittal_pk', $transmittal_pk);
  $stmt->execute();


  $db->commit();
  echo json_encode([
    'success' => true,
    'message' => 'Contract updated successfully',
  ]);
} catch (Exception $e) {
  if ($db->inTransaction()) $db->rollBack();

  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
