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
  $stmt0 = $db->prepare("SELECT transmittal_fk FROM transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt0->execute(["transmittal_item_pk" => $id]);
  $row = $stmt0->fetch(PDO::FETCH_ASSOC);
  if (!$row) {
    error_log($id);
    http_response_code(404);
    echo json_encode([
      'success' => false,
    ]);
    exit;
  }
  $transmittal_pk = $row['transmittal_fk'] ?? null;

  if (!is_missing($_GET, 'withCountCheck')) {
    // CHECKING COUNTS
    $stmt1 = $db->prepare("SELECT COUNT(*) FROM transmittal_item WHERE transmittal_fk = :transmittal_fk");
    $stmt1->bindValue(':transmittal_fk', $transmittal_pk);
    $stmt1->execute();

    $count = (int) $stmt1->fetchColumn();

    if ($count === 1) {
      http_response_code(409);
      echo json_encode([
        'success' => false,
        "transmittal_pk" => $transmittal_pk
      ]);
      exit;
    }
  }

  $stmt2 = $db->prepare("DELETE FROM transmittal_item WHERE transmittal_item_pk = :transmittal_item_pk");
  $stmt2->execute(["transmittal_item_pk" => $id]);

  if ($stmt2->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'success' => false,
      'message' => "Conflict",
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
