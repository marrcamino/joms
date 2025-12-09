<?php
require_once __DIR__ . '/../helpers.php';

try {


  $db = getDatabase();
  $input = json_decode(file_get_contents('php://input'), true);
  $startDate =  $input['startDate'];
  $endDate = $input['endDate'];

  $stmt = $db->prepare("
    SELECT *
    FROM transmittal
    WHERE :start <= end_date AND :end >= start_date");

  $stmt->bindValue(':start',  $startDate);
  $stmt->bindValue(':end', $endDate);
  $stmt->execute();
  $overlaps = $stmt->fetchAll(PDO::FETCH_ASSOC);

  if (count($overlaps) > 0) {
    echo json_encode([
      "error" => true,
      "message" => "This transmittal overlaps with existing transmittals.",
      "overlaps" => $overlaps
    ]);
    exit;
  }

  echo json_encode([
    "error" => false,
    "message" => null,
    "overlaps" => $overlaps
  ]);
} catch (PDOException $e) {
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to get transmittal: ' . $e->getMessage()
  ]);
}
