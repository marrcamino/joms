<?php
require_once __DIR__ . '/../../helpers.php';

try {
  $db = getDatabase();

  if (is_missing($_GET, 'transmittal_fk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing transmittal_fk'
    ]);
    exit;
  }

  $includeContract = isset($_GET['include']) && $_GET['include'] === 'contract';

  $sql = "
    SELECT 
      ti.*
      " . ($includeContract ? ", c.*" : "") . "
    FROM transmittal_item ti
  ";

  if ($includeContract) {
    $sql .= "
      LEFT JOIN contract c
        ON c.transmittal_item_fk = ti.transmittal_item_pk
    ";
  }

  $sql .= " WHERE ti.transmittal_fk = :transmittal_fk";

  $stmt = $db->prepare($sql);
  $stmt->execute([
    ':transmittal_fk' => $_GET['transmittal_fk'],
  ]);

  $transmittalItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($transmittalItems);
} catch (Exception $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
