<?php

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
 * @param string $startDate new contract start date in ISO format (YYYY-MM-DD)
 * @param string $endDate new contract end date in ISO format (YYYY-MM-DD)
 * @return array array of overlapping contracts; empty if none
 */
function getOverlappingContracts(PDO $db, int $employeeId, string $startDate, string $endDate): array
{
  $stmt = $db->prepare("
        SELECT * FROM contract
        WHERE employee_fk = :emp
          AND :start <= end_date
          AND :end >= start_date
    ");

  $stmt->bindValue(':emp', $employeeId, PDO::PARAM_INT);
  $stmt->bindValue(':start', $startDate, PDO::PARAM_STR);
  $stmt->bindValue(':end', $endDate, PDO::PARAM_STR);

  $stmt->execute();

  return $stmt->fetchAll(PDO::FETCH_ASSOC);
}
