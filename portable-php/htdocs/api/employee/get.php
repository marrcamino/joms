<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Get query parameters
  $sort = $_GET['sort'] ?? 'employee_pk'; // default sort column
  $order = strtoupper($_GET['order'] ?? 'ASC'); // ASC or DESC
  $limit = (int)($_GET['limit'] ?? 20); // default 20 rows
  $offset = (int)($_GET['offset'] ?? 0); // default offset 0
  $is_active_param = $_GET['is_active'] ?? '1'; // default "1" can be all

  // Allow only certain columns to sort by (avoid SQL injection)
  $allowedSort = ['employee_pk', 'firstname', 'lastname', 'birthday'];
  if (!in_array($sort, $allowedSort)) {
    $sort = 'employee_pk';
  }

  // Allow only ASC or DESC
  if (!in_array($order, ['ASC', 'DESC'])) {
    $order = 'ASC';
  }

  // Build SQL query dynamically depending on is_active param
  if ($is_active_param === 'all') {
    $sql = "
      SELECT *
      FROM employee
      ORDER BY $sort $order
      LIMIT :limit OFFSET :offset
    ";
    $stmt = $db->prepare($sql);
  } else {
    // Coerce to int (0 or 1)
    $is_active = (int)$is_active_param;
    $sql = "
      SELECT *
      FROM employee
      WHERE is_active = :is_active
      ORDER BY $sort $order
      LIMIT :limit OFFSET :offset
    ";
    $stmt = $db->prepare($sql);
    $stmt->bindValue(':is_active', $is_active, PDO::PARAM_INT);
  }

  $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
  $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
  $stmt->execute();

  $employees = $stmt->fetchAll(PDO::FETCH_ASSOC);

  echo json_encode($employees);
} catch (Exception $e) {
  http_response_code(500);
  echo json_encode([
    'status' => 'error',
    'message' => $e->getMessage()
  ]);
}
