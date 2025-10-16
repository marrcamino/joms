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
