<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();

  // Validate contract_pk
  if (!isset($_GET['contract_pk']) || empty($_GET['contract_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing contract_pk']);
    exit;
  }

  $contractPk = (int)$_GET['contract_pk'];

  // Read JSON body
  $input = json_decode(file_get_contents('php://input'), true);
  if (!$input) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON body']);
    exit;
  }

  // Prepare update
  $stmt = $db->prepare("
    UPDATE contract
    SET
      start_date = :startDate,
      end_date = :endDate,
      designation = :designation,
      rate = :rate,
      office_fk = :officePk,
      position_category_fk = :positionCategoryFk
    WHERE contract_pk = :contract_pk
  ");


  $stmt->bindValue(':startDate',   $input['startDate']);
  $stmt->bindValue(':endDate',     $input['endDate']);
  $stmt->bindValue(':designation',  $input['designation']);
  $stmt->bindValue(':rate',         $input['rate']);
  $stmt->bindValue(':officePk',    $input['officePk']);
  $stmt->bindValue(':positionCategoryFk', $input['positionCategoryFk']);
  $stmt->bindValue(':contract_pk',  $contractPk, PDO::PARAM_INT);

  $stmt->execute();

  echo json_encode([
    'success' => true,
    'message' => 'Contract updated successfully',
  ]);
} catch (PDOException $e) {
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to update contract: ' . $e->getMessage()]);
}
