<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  if (!is_missing($_GET, 'position_category_pk')) {
    $position_category_pk = $_GET['position_category_pk'];
    $stmt0 = $db->prepare('SELECT * FROM position_category WHERE position_category_pk = :position_category_pk LIMIT 1');
    $stmt0->bindValue(':position_category_pk', $position_category_pk, PDO::PARAM_INT);
    $stmt0->execute();
    $singleCategory = $stmt0->fetch(PDO::FETCH_ASSOC);

    echo json_encode($singleCategory);
    exit;
  }


  $stmt = $db->prepare("SELECT * FROM position_category");
  $stmt->execute();

  $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($categories);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
