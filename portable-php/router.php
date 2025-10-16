<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// wh Handle preflight request properly
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// Define routes grouped by HTTP method
$routes = [
  'GET' => [
    '/api/employee' => 'htdocs/api/employee/get.php',
  ],
  'POST' => [
    '/api/employee' => 'htdocs/api/employee/create.php',
    '/api/employee/check-duplicate' => 'htdocs/api/employee/check-duplicate.php',
  ],
  'PUT' => [
    '/api/employees' => 'htdocs/api/employees/update.php',
  ],
  'DELETE' => [
    '/api/employees' => 'htdocs/api/employees/delete.php',
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
