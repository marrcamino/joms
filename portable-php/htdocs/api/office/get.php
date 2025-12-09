<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  if (!is_missing($_GET, 'office_pk')) {
    $stmt0 = $db->prepare('SELECT * FROM office WHERE office_pk = :office_pk LIMIT 1');
    $stmt0->execute([
      ":office_pk" =>  $_GET['office_pk'],
    ]);
    $office = $stmt0->fetch(PDO::FETCH_ASSOC);

    echo json_encode($office);
    exit;
  }


  $stmt = $db->prepare("SELECT * FROM office");
  $stmt->execute();

  $offices = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($offices);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
