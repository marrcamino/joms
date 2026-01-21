<?php
require_once __DIR__ . '/../helpers.php';


try {
  $db = getDatabase();
  $db->beginTransaction();

  $input = json_decode(file_get_contents('php://input'), true);

  if (is_missing($_GET, 'transmittal_pk')) {
    http_response_code(400);
    echo json_encode([
      'status' => 'error',
      'message' => 'Missing transmittal_pk'
    ]);
    exit;
  }

  $stmt = buildPatchStatement($db, 'transmittal', $input, $_GET['transmittal_pk']);
  $stmt->execute();

  if (!is_missing($input["appointment_status"])) {
    $stmt2 = $db->prepare("
      UPDATE contract
      SET appointment_status = :status
      WHERE source_type = 'transmittal'
        AND transmittal_item_fk IN (
          SELECT transmittal_item_pk
          FROM transmittal_item
          WHERE transmittal_fk = :transmittal_pk
        );
    ");

    $stmt2->bindValue(':status', $input["appointment_status"], PDO::PARAM_INT);
    $stmt2->bindValue(':transmittal_pk', $_GET['transmittal_pk'], PDO::PARAM_INT);
    $stmt2->execute();
  }

  if ($stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode([
      'status' => 'error',
      'message' => 'Transmittal not found or no changes made'
    ]);
    exit;
  }

  $db->commit();
  echo json_encode([
    'success' => true,
  ]);
} catch (PDOException $e) {
  if ($db->inTransaction()) $db->rollBack();
  error_log('PDO ERROR: ' . $e->getMessage());
  http_response_code(500);
  echo json_encode([
    'error' => 'Failed to update office: ' . $e->getMessage()
  ]);
}
