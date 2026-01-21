<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// wh Handle preflight request properly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Disable PHP from sending errors to output
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Convert all errors to exceptions
set_error_handler(function ($severity, $message, $file, $line) {
  throw new ErrorException($message, 0, $severity, $file, $line);
});

// Catch uncaught exceptions to ensure JSON response
set_exception_handler(function ($e) {
  http_response_code(500);
  echo json_encode([
    'error' => true,
    'message' => 'Internal Server Error'
  ]);
  error_log(
    $e->getMessage() . " in {$e->getFile()}:{$e->getLine()}"
  );
});

$viewRoutes = ['/api/view/transmittal-items' => 'htdocs/api/view/transmittal-item.php',];

// Define routes grouped by HTTP method
$routes = [
  'GET' => [
    '/api/employee' => 'htdocs/api/employee/get.php',
    '/api/employee/search' => 'htdocs/api/employee/search.php',
    '/api/employee/contract' => 'htdocs/api/employee/contract/get.php',
    '/api/employee/contract/latest' => 'htdocs/api/employee/contract/latest.php',
    '/api/employee/contract/check-pds-present' => 'htdocs/api/employee/contract/check-pds-present.php',
    '/api/office' => 'htdocs/api/office/get.php',
    '/api/office/transmittal' => 'htdocs/api/office/transmittal/get.php',
    '/api/transmittal' => 'htdocs/api/transmittal/get.php',
    '/api/transmittal/transmittal-item' => 'htdocs/api/transmittal/transmittal-item/get.php',
    '/api/position-category' => 'htdocs/api/position-category/get.php',
    '/api/get-emp-counts' => 'htdocs/api/office/get-emp-counts.php',
    ...$viewRoutes,
  ],
  'POST' => [
    '/api/employee' => 'htdocs/api/employee/create.php',
    '/api/office' => 'htdocs/api/office/create.php',
    '/api/employee/check-duplicate' => 'htdocs/api/employee/check-duplicate.php',
    '/api/office/check-duplicate' => 'htdocs/api/office/check-duplicate.php',
    '/api/office/transmittal' => 'htdocs/api/office/transmittal/create.php',
    '/api/transmittal/check-overlap' => 'htdocs/api/transmittal/check-overlap.php',
    '/api/transmittal/transmittal_item' => 'htdocs/api/transmittal/transmittal-item/create.php',
    '/api/employee/contract' => 'htdocs/api/employee/contract/create.php',
    '/api/employee/contract/check-overlap' => 'htdocs/api/employee/contract/check-overlap.php',
  ],
  'PUT' => [
    '/api/contract' => 'htdocs/api/contract/update.php',
  ],
  'PATCH' => [
    '/api/contract/set-active' => 'htdocs/api/contract/set-active.php',
    '/api/employee/update' => 'htdocs/api/employee/update.php',
    '/api/office/update' => 'htdocs/api/office/update.php',
    '/api/transmittal' => 'htdocs/api/transmittal/update.php',
    '/api/transmittal-item' => 'htdocs/api/transmittal-item/update.php',
  ],
  'DELETE' => [
    '/api/employee/contract' => 'htdocs/api/employee/contract/delete.php',
    '/api/employee' => 'htdocs/api/employee/delete.php',
    '/api/office' => 'htdocs/api/office/delete.php',
    '/api/transmittal' => 'htdocs/api/transmittal/delete.php',
    '/api/transmittal-item' => 'htdocs/api/transmittal-item/delete.php',
  ],
];

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Serve static files directly (like index.html, etc.)
$file = __DIR__ . '/htdocs' . $path;
if (is_file($file)) {
  return false;
}

// Check if route exists for this method
if (isset($routes[$method][$path])) {
  require __DIR__ . '/' . $routes[$method][$path];
  exit;
}

// Optional: Handle unknown methods for existing paths
if (array_key_exists($path, array_merge(...array_values($routes)))) {
  http_response_code(405); // Method Not Allowed
  echo json_encode(['error' => "Method $method not allowed for $path"]);
} else {
  http_response_code(404); // Not Found
  echo json_encode(['error' => "Route $path not found"]);
}
