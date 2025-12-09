<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // single transmittal by PK
  if (!is_missing($_GET, 'transmittal_pk')) {
    $stmt = $db->prepare("
      SELECT *
      FROM transmittal
      WHERE transmittal_pk = :transmittal_pk
      LIMIT 1
    ");
    $stmt->execute([
      ':transmittal_pk' => (int) $_GET['transmittal_pk'],
    ]);

    $transmittal = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($transmittal);
    exit;
  }

  // list query
  $sql = "SELECT * FROM transmittal";
  $where = [];
  $params = [];

  if (!is_missing($_GET, 'office_pk')) {
    $where[] = "office_fk = :office_pk";
    $params[':office_pk'] = (int) $_GET['office_pk'];
  }

  if ($where) {
    $sql .= " WHERE " . implode(" AND ", $where);
  }

  $sql .= " ORDER BY start_date DESC";

  if (!is_missing($_GET, 'limit')) {
    $sql .= " LIMIT :limit";
  }

  $stmt = $db->prepare($sql);

  foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v, PDO::PARAM_INT);
  }

  if (!is_missing($_GET, 'limit')) {
    $stmt->bindValue(':limit', (int) $_GET['limit'], PDO::PARAM_INT);
  }

  $stmt->execute();
  $transmittals = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($transmittals);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
