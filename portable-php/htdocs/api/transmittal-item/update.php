<?php
require_once __DIR__ . '/../helpers.php';

try {
  if (is_missing($_GET, 'transmittal_item_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing transmittal_item_pk'
    ]);
    exit;
  }


  $db = getDatabase();
  $db->beginTransaction();

  $input = json_decode(file_get_contents('php://input'), true);
  $transmittal_item_pk = (int)$_GET['transmittal_item_pk'];

  // Updating Transmittal Item
  $stmt = $db->prepare("
    UPDATE transmittal_item 
    SET fund_charge = :fund_charge, 
      num_of_days = :num_of_days 
    WHERE transmittal_item_pk = :transmittal_item_pk
  ");
  $stmt->bindValue(':fund_charge', $input['fund_charge']);
  $stmt->bindValue(':num_of_days', $input['num_of_days']);
  $stmt->bindValue(':transmittal_item_pk', $transmittal_item_pk);
  $stmt->execute();

  // Update contract
  $stmt = $db->prepare("
    UPDATE contract 
    SET start_date = :start_date, 
      end_date = :end_date, 
      designation = :designation,  
      rate = :rate,  
      office_fk = :office_fk  
    WHERE transmittal_item_fk = :transmittal_item_fk
  ");
  $stmt->bindValue(':start_date', $input['start_date']);
  $stmt->bindValue(':end_date', $input['end_date']);
  $stmt->bindValue(':designation', $input['designation']);
  $stmt->bindValue(':rate', $input['rate']);
  $stmt->bindValue(':office_fk', $input['office_fk']);
  $stmt->bindValue(':transmittal_item_fk', $transmittal_item_pk);
  $stmt->execute();


  $stmt = $db->prepare("SELECT transmittal_fk FROM transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt->execute([":transmittal_item_pk" =>  $transmittal_item_pk]);
  $transmittal_fk = $stmt->fetch(PDO::FETCH_ASSOC)["transmittal_fk"];

  syncTransmittalFromContracts($db, $transmittal_fk);

  // Get info after updates
  $stmt = $db->prepare("SELECT * FROM v_transmittal_contract_items WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt->execute([":transmittal_item_pk" =>  $transmittal_item_pk]);
  $transmittals = $stmt->fetch(PDO::FETCH_ASSOC);

  $db->commit();
  echo json_encode($transmittals);
} catch (Exception $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
