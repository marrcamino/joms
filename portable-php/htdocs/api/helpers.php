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
