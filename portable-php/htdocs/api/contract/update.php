<?php
require_once __DIR__ . '/../helpers.php';

try {
  $db = getDatabase();
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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

  // start transaction
  $db->beginTransaction();

  // Prepare update (no null checks — client provides proper values)
  $stmt = $db->prepare("
    UPDATE contract
    SET
      start_date = :startDate,
      end_date = :endDate,
      designation = :designation,
      rate = :rate,
      office_fk = :officePk,
      remarks = :remarks,
      position_category_fk = :positionCategoryFk
    WHERE contract_pk = :contract_pk
  ");

  $stmt->bindValue(':startDate', $input['startDate']);
  $stmt->bindValue(':endDate', $input['endDate']);
  $stmt->bindValue(':designation', $input['designation']);
  $stmt->bindValue(':rate', $input['rate']);
  $stmt->bindValue(':officePk', $input['officePk']);
  $stmt->bindValue(':positionCategoryFk', $input['positionCategoryFk']);
  $stmt->bindValue(':remarks', $input['remarks']);
  $stmt->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);

  $stmt->execute();

  // Fetch the updated contract so we can sync the employee if contract is active
  $contractStmt = $db->prepare("
    SELECT employee_fk, is_active
    FROM contract
    WHERE contract_pk = :contract_pk
    LIMIT 1
  ");
  $contractStmt->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);
  $contractStmt->execute();
  $contractInfo = $contractStmt->fetch(PDO::FETCH_ASSOC);

  if ($contractInfo && (int)$contractInfo['is_active'] === 1) {
    $updateEmp = $db->prepare("
      UPDATE employee
      SET office_fk = :office_fk,
          designation = :designation
      WHERE employee_pk = :employee_pk
    ");

    $updateEmp->bindValue(':office_fk', $input['officePk']);
    $updateEmp->bindValue(':designation', $input['designation']);
    $updateEmp->bindValue(':employee_pk', (int)$contractInfo['employee_fk'], PDO::PARAM_INT);
    $updateEmp->execute();
  }

  $db->commit();

  echo json_encode([
    'success' => true,
    'message' => 'Contract updated successfully',
  ]);
} catch (Exception $e) {
  if ($db->inTransaction()) $db->rollBack();

  error_log("ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to update contract: ' . $e->getMessage()]);
}
