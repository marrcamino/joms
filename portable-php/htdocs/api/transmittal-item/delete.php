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

  // $transmittal_pk
  $id = (int)$_GET['transmittal_item_pk'];

  // Get transmittal_pk
  $stmt1 = $db->prepare("SELECT transmittal_fk FROM transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt1->execute(["transmittal_item_pk" => $id]);
  $transmittal_pk = $stmt1->fetch(PDO::FETCH_ASSOC)['transmittal_fk'];

  $stmt2 = $db->prepare("DELETE FROM transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt2->execute(["transmittal_item_pk" => $id]);

  if ($stmt2->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'success' => false,
    ]);
    exit;
  }

  $stmt3 = $db->prepare("
    SELECT GROUP_CONCAT(fund_charge, ', ') AS funding_charge
    FROM (
      SELECT DISTINCT fund_charge
      FROM transmittal_item
      WHERE transmittal_fk = :transmittal_fk
      ORDER BY fund_charge
    )
  ");
  syncTransmittalFromContracts($db, $transmittal_pk);

  $db->commit();

  echo json_encode([
    'success' => true,
  ]);
} catch (Exception $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
