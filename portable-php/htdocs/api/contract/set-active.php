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
  $contractPk = (int)$_GET['contract_pk'];
  $activeValue = (int)$input['is_active'];

  $db->beginTransaction();

  if ($activeValue === 1) {

    if (!isset($_GET['employee_fk']) || empty($_GET['employee_fk'])) {
      http_response_code(400);
      echo json_encode(['status' => 'error', 'message' => 'Missing employee_fk']);
      exit;
    }

    $stmt1 = $db->prepare("
      UPDATE contract
      SET is_active = 0
      WHERE is_active = 1 AND employee_fk = :employee_fk
    ");
    $stmt1->bindValue(':employee_fk', (int)$_GET['employee_fk'], PDO::PARAM_INT);
    $stmt1->execute();


    $stmt2 = $db->prepare("
      UPDATE contract
      SET is_active = 1
      WHERE contract_pk = :contract_pk
    ");
    $stmt2->bindValue(':contract_pk', $contractPk, PDO::PARAM_INT);
    $stmt2->execute();


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
}
