<?php
require_once __DIR__ . '/../../helpers.php';

try {
  $db = getDatabase();
  $db->beginTransaction();

  // Validate employee_id
  if (!isset($_GET['contract_pk']) || empty($_GET['contract_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing contract_pk']);
    exit;
  }

  $contractId = $_GET['contract_pk'];

  // Get request body data
  $input = json_decode(file_get_contents('php://input'), true);

  // Validate required fields
  if (!isset($input['employee_pk'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing employee_pk']);
    exit;
  }

  $employeePk = $input['employee_pk'];

  // Delete contract record
  $stmt = $db->prepare('DELETE FROM contract WHERE contract_pk = ?');
  $stmt->execute([$contractId]);

  // Update employee properties
  if ($input['is_active']) {
    $stmt2 = $db->prepare("
    UPDATE employee
    SET
    office_fk = :office_fk,
    designation = :designation,
    is_active = :is_active
    WHERE employee_pk = :employee_pk
    ");

    $stmt2->bindValue(':office_fk', $input['office_fk'] ?? null, pdoParamNullable($input['office_fk'] ?? null, PDO::PARAM_INT));
    $stmt2->bindValue(':designation', $input['designation'] ?? null, pdoParamNullable($input['designation'] ?? null, PDO::PARAM_STR));
    $stmt2->bindValue(':is_active', $input['is_active'] ?? 0);
    $stmt2->bindValue(':employee_pk', $employeePk, PDO::PARAM_INT);

    $stmt2->execute();
  };

  $db->commit();

  http_response_code(200);
  echo json_encode(['status' => 'success', 'message' => 'Contract deleted and employee updated successfully']);
} catch (PDOException $e) {
  $db->rollBack();
  error_log("PDO ERROR: " . $e->getMessage());
  http_response_code(500);
  echo json_encode(['error' => 'Failed to delete contract: ' . $e->getMessage()]);
}
