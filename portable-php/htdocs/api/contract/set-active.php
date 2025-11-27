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

  $input = json_decode(file_get_contents('php://input'), true);
  if (!isset($input['is_active'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing is_active in request body']);
    exit;
  }

  $contractPk = (int)$_GET['contract_pk'];
  $activeValue = (int)$input['is_active'];

  $db->beginTransaction();

  if ($activeValue === 1) {

    if (!isset($_GET['employee_fk']) || empty($_GET['employee_fk'])) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Missing employee_fk']);
      exit;
    }

    // Deactivate other active contracts for this employee
    $stmt1 = $db->prepare("
      UPDATE contract
      SET is_active = 0
      WHERE is_active = 1 AND employee_fk = :employee_fk
    ");
    $stmt1->bindValue(':employee_fk', (int)$_GET['employee_fk'], PDO::PARAM_INT);
    $stmt1->execute();

    // Activate the requested contract
    $stmt2 = $db->prepare("
      UPDATE contract
      SET is_active = 1
      WHERE contract_pk = :contract_pk
    ");
    $stmt2->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);
    $stmt2->execute();

    // Fetch contract info to sync employee
    $contractStmt = $db->prepare("
      SELECT contract_pk, employee_fk, office_fk, designation
      FROM contract
      WHERE contract_pk = :contract_pk
      LIMIT 1
    ");
    $contractStmt->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);
    $contractStmt->execute();
    $contractInfo = $contractStmt->fetch(PDO::FETCH_ASSOC);

    if (!$contractInfo) {
      throw new Exception('Contract not found after update');
    }

    // Update employee to match the active contract
    $updateEmp = $db->prepare("
      UPDATE employee
      SET office_fk = :office_fk,
          designation = :designation,
          is_active = 1
      WHERE employee_pk = :employee_pk
    ");

    if ($contractInfo['office_fk'] === null) {
      $updateEmp->bindValue(':office_fk', null, PDO::PARAM_NULL);
    } else {
      $updateEmp->bindValue(':office_fk', (int)$contractInfo['office_fk'], PDO::PARAM_INT);
    }

    if ($contractInfo['designation'] === null) {
      $updateEmp->bindValue(':designation', null, PDO::PARAM_NULL);
    } else {
      $updateEmp->bindValue(':designation', $contractInfo['designation'], PDO::PARAM_STR);
    }

    $updateEmp->bindValue(':employee_pk', (int)$contractInfo['employee_fk'], PDO::PARAM_INT);
    $updateEmp->execute();

    $db->commit();

    echo json_encode([
      'success' => true,
      'message' => 'Contract activated successfully'
    ]);
    exit;
  }

  // If user wants to deactivate this contract (is_active = 0)
  $stmt = $db->prepare("
    UPDATE contract
    SET is_active = 0
    WHERE contract_pk = :contract_pk
  ");

  $stmt->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);
  $stmt->execute();

  // Find the employee for this contract so we can reset properties
  $contractStmt = $db->prepare("
    SELECT employee_fk FROM contract WHERE contract_pk = :contract_pk LIMIT 1
  ");
  $contractStmt->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);
  $contractStmt->execute();
  $contractInfo = $contractStmt->fetch(PDO::FETCH_ASSOC);

  if ($contractInfo && isset($contractInfo['employee_fk'])) {
    $employeePk = (int)$contractInfo['employee_fk'];

    $resetEmp = $db->prepare("
      UPDATE employee
      SET office_fk = NULL,
          designation = NULL,
          is_active = 0
      WHERE employee_pk = :employee_pk
    ");
    $resetEmp->bindValue(':employee_pk', $employeePk, PDO::PARAM_INT);
    $resetEmp->execute();
  }

  $db->commit();

  echo json_encode([
    'success' => true,
    'message' => 'Contract deactivated successfully'
  ]);
} catch (PDOException $e) {
  if ($db->inTransaction()) {
    $db->rollBack();
  }

  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);

  echo json_encode([
    'error' => 'Failed to update contract status: ' . $e->getMessage()
  ]);
} catch (Exception $e) {
  if ($db->inTransaction()) {
    $db->rollBack();
  }

  error_log("ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to update contract status: ' . $e->getMessage()
  ]);
}
