<?php

declare(strict_types=1);

/**
 * Helper functions for the API
 */
function nullable(string $value)
{
  return $value === '' ? null : $value;
}

/**
 * Get a PDO database connection
 */
function getDatabase()
{
  static $db = null;

  if ($db === null) {
    $db = new PDO('sqlite:data/db.sqlite');
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Enable foreign key support for this connection
    $db->exec('PRAGMA foreign_keys = ON');
  }

  return $db;
}



/**
 * Determines the correct PDO parameter type based on the given value.
 *
 * If the value is null, returns PDO::PARAM_NULL.
 * Otherwise, returns the given $typeIfNotNull if it is one of:
 *   PDO::PARAM_INT, PDO::PARAM_STR, PDO::PARAM_LOB, or PDO::PARAM_BOOL.
 * Invalid types fallback to PDO::PARAM_STR.
 *
 * @param mixed $value The value to be bound in a PDO statement.
 * @param PDO::PARAM_INT|PDO::PARAM_STR|PDO::PARAM_LOB|PDO::PARAM_BOOL|null $typeIfNotNull The PDO parameter type to use if value is not null.
 *                                One of PDO::PARAM_INT, PDO::PARAM_STR, PDO::PARAM_LOB, or PDO::PARAM_BOOL.
 *                                If omitted, defaults to auto-detection based on PHP type.
 *
 * @return int The appropriate PDO::PARAM_* constant for the given value.
 */

function pdoParamNullable(mixed $value, ?int $typeIfNotNull = null): int
{
  if ($value === null) {
    return PDO::PARAM_NULL;
  }

  if ($typeIfNotNull === null) {
    if (is_int($value)) return PDO::PARAM_INT;
    if (is_bool($value)) return PDO::PARAM_BOOL;
    if (is_resource($value)) return PDO::PARAM_LOB;
    return PDO::PARAM_STR;
  }

  return $typeIfNotNull;
}


/**
 * Get overlapping contracts for an employee
 *
 * @param PDO $db database instance
 * @param int $employeeId employee primary key
 * @param string $startDate new contract start date (YYYY-MM-DD)
 * @param string $endDate new contract end date (YYYY-MM-DD)
 * @param string|null $sourceType optional contract source type; defaults to "contract"
 * @return array
 */
function getOverlappingContracts(
  PDO $db,
  int $employeeId,
  string $startDate,
  string $endDate,
  ?string $sourceType = null
): array {
  // default to 'contract' if not provided
  if ($sourceType === null) {
    $sourceType = 'contract';
  }

  $sql = "
    SELECT *
    FROM contract
    WHERE employee_fk = :emp
      AND :start <= end_date
      AND :end >= start_date
      AND source_type = :source_type
  ";

  $stmt = $db->prepare($sql);
  $stmt->bindValue(':emp', $employeeId, PDO::PARAM_INT);
  $stmt->bindValue(':start', $startDate, PDO::PARAM_STR);
  $stmt->bindValue(':end', $endDate, PDO::PARAM_STR);
  $stmt->bindValue(':source_type', $sourceType, PDO::PARAM_STR);
  $stmt->execute();

  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}





/**
 * Checks if there is `no value` or `unset`.
 *
 * Accepts either a raw value (`null`, `''`, etc.) **or** an array with a key.
 * Numeric `0` and string `'0'` are considered valid.
 *
 * @param mixed $valueOrArray Either a single value to check, or an array to check against
 * @param string|null $key Optional. If $valueOrArray is an array, the key to check
 * @return bool True if missing, false otherwise
 *
 * @example
 * is_missing('');                  // true
 * is_missing(0);                   // false
 * is_missing($_GET, 'office_pk');  // true if not set
 */
function is_missing(mixed $valueOrArray, ?string $key = null): bool
{

  if (is_array($valueOrArray)) {
    if ($key === null || trim($key) === '') return false;
    $value = $valueOrArray[$key] ?? null;
    return $value === null || trim($value) === '';
  }

  // simple value check
  return $valueOrArray === null || $valueOrArray === '';
}

$tables = [
  "transmittal" =>  ["office_fk", "start_date", 'end_date', 'funding_charge', 'remarks']
];

/**
 * Build a PATCH-style UPDATE statement using predefined table fields.
 * PK is passed separately.
 *
 * @param PDO $db
 * @param string $table Table name
 * @param array $input JSON-decoded input
 * @param int|string $id Primary key value
 * @return PDOStatement
 * @throws Exception
 */
function buildPatchStatement(PDO $db, string $table, array $input, $id): PDOStatement
{
  global $tables;

  if (!isset($tables[$table])) {
    throw new Exception("No field definition for table '$table'");
  }

  $fields = $tables[$table];

  $set = [];
  foreach ($fields as $field) {
    if (array_key_exists($field, $input)) {
      $set[] = "$field = :$field";
    }
  }

  if (empty($set)) {
    throw new Exception("No fields provided to update for table '$table'");
  }

  $pk = $table . '_pk';
  $sql = sprintf(
    "UPDATE %s SET %s WHERE %s = :pk",
    $table,
    implode(', ', $set),
    $pk
  );

  $stmt = $db->prepare($sql);

  foreach ($fields as $field) {
    if (array_key_exists($field, $input)) {
      $stmt->bindValue(":$field", $input[$field]);
    }
  }

  $stmt->bindValue(':pk', $id);

  return $stmt;
}



/**
 * Sync transmittal dates and funding charge
 * based on all related transmittal_items
 *
 * @param PDO $db
 * @param int $transmittalFk
 * @return void
 */
function syncTransmittalFromContracts(PDO $db, int $transmittalFk): void
{
  $stmt = $db->prepare("
        SELECT
            MIN(c.start_date) AS start_date,
            MAX(c.end_date) AS end_date,
            (
                SELECT GROUP_CONCAT(fund_charge, ', ')
                FROM (
                    SELECT DISTINCT ti.fund_charge
                    FROM transmittal_item ti
                    WHERE ti.transmittal_fk = :transmittal_fk
                    ORDER BY ti.fund_charge
                )
            ) AS funding_charge
        FROM contract c
        JOIN transmittal_item ti
            ON ti.transmittal_item_pk = c.transmittal_item_fk
        WHERE
            ti.transmittal_fk = :transmittal_fk
            AND c.source_type = 'transmittal'
    ");

  $stmt->execute(["transmittal_fk" => $transmittalFk]);
  $data = $stmt->fetch(PDO::FETCH_ASSOC);

  // No remaining contracts
  if (!$data["start_date"] || !$data["end_date"]) {
    $stmt = $db->prepare("
            UPDATE transmittal
            SET
                start_date = NULL,
                end_date = NULL,
                funding_charge = NULL
            WHERE transmittal_pk = :pk
        ");
    $stmt->execute(["pk" => $transmittalFk]);
    return;
  }

  // Update transmittal
  $stmt = $db->prepare("
        UPDATE transmittal
        SET
            start_date = :start_date,
            end_date = :end_date,
            funding_charge = :funding_charge
        WHERE transmittal_pk = :pk
    ");

  $stmt->execute([
    "start_date"     => $data["start_date"],
    "end_date"       => $data["end_date"],
    "funding_charge" => $data["funding_charge"],
    "pk"             => $transmittalFk
  ]);
}
