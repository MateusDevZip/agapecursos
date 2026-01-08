<?php
/**
 * Courses API - RESTful API for managing courses
 * Endpoints:
 * - GET /api/courses.php - List all courses (with filters)
 * - GET /api/courses.php?id={id} - Get specific course
 * - POST /api/courses.php - Create new course
 * - PUT /api/courses.php?id={id} - Update course
 * - DELETE /api/courses.php?id={id} - Delete course
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? $_GET['id'] : null;

try {
    switch ($method) {
        case 'GET':
            if ($id) {
                getCourse($id);
            } else {
                getCourses();
            }
            break;

        case 'POST':
            createCourse();
            break;

        case 'PUT':
            if (!$id) {
                throw new Exception('Course ID is required for update');
            }
            updateCourse($id);
            break;

        case 'DELETE':
            if (!$id) {
                throw new Exception('Course ID is required for delete');
            }
            deleteCourse($id);
            break;

        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}

/**
 * Get all courses with optional filters
 */
function getCourses()
{
    $endpoint = 'courses?select=*';

    // Apply filters
    $filters = [];

    if (isset($_GET['pilar'])) {
        $filters[] = 'pilar=eq.' . urlencode($_GET['pilar']);
    }

    if (isset($_GET['level'])) {
        $filters[] = 'level=eq.' . urlencode($_GET['level']);
    }

    if (isset($_GET['status'])) {
        $filters[] = 'status=eq.' . urlencode($_GET['status']);
    } else {
        // Default: only show active courses for public
        $filters[] = 'status=eq.active';
    }

    if (isset($_GET['min_price'])) {
        $filters[] = 'price=gte.' . floatval($_GET['min_price']);
    }

    if (isset($_GET['max_price'])) {
        $filters[] = 'price=lte.' . floatval($_GET['max_price']);
    }

    if (isset($_GET['search'])) {
        $search = urlencode($_GET['search']);
        $filters[] = 'or=(title.ilike.*' . $search . '*,description.ilike.*' . $search . '*)';
    }

    if (!empty($filters)) {
        $endpoint .= '&' . implode('&', $filters);
    }

    // Ordering
    $endpoint .= '&order=created_at.desc';

    // Pagination
    if (isset($_GET['limit'])) {
        $endpoint .= '&limit=' . intval($_GET['limit']);
    }

    if (isset($_GET['offset'])) {
        $endpoint .= '&offset=' . intval($_GET['offset']);
    }

    $result = supabaseRequest($endpoint, 'GET');

    if ($result['code'] === 200) {
        echo json_encode([
            'success' => true,
            'data' => $result['data']
        ]);
    } else {
        http_response_code($result['code']);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to fetch courses',
            'details' => $result['data']
        ]);
    }
}

/**
 * Get a specific course by ID
 */
function getCourse($id)
{
    $endpoint = 'courses?id=eq.' . urlencode($id);

    $result = supabaseRequest($endpoint, 'GET');

    if ($result['code'] === 200 && !empty($result['data'])) {
        echo json_encode([
            'success' => true,
            'data' => $result['data'][0]
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Course not found'
        ]);
    }
}

/**
 * Create a new course
 */
function createCourse()
{
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    $required = ['title', 'pilar', 'price'];
    foreach ($required as $field) {
        if (!isset($input[$field]) || empty($input[$field])) {
            throw new Exception("Field '$field' is required");
        }
    }

    // Prepare course data
    $courseData = [
        'title' => $input['title'],
        'description' => $input['description'] ?? null,
        'pilar' => $input['pilar'],
        'level' => $input['level'] ?? null,
        'duration_hours' => isset($input['duration_hours']) ? intval($input['duration_hours']) : null,
        'price' => floatval($input['price']),
        'original_price' => isset($input['original_price']) ? floatval($input['original_price']) : null,
        'image_url' => $input['image_url'] ?? null,
        'status' => $input['status'] ?? 'active'
    ];

    $result = supabaseRequest('courses', 'POST', $courseData);

    if ($result['code'] === 201) {
        http_response_code(201);
        echo json_encode([
            'success' => true,
            'message' => 'Course created successfully',
            'data' => $result['data'][0]
        ]);
    } else {
        http_response_code($result['code']);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create course',
            'details' => $result['data']
        ]);
    }
}

/**
 * Update an existing course
 */
function updateCourse($id)
{
    $input = json_decode(file_get_contents('php://input'), true);

    // Prepare update data (only include provided fields)
    $updateData = [];

    $allowedFields = ['title', 'description', 'pilar', 'level', 'duration_hours', 'price', 'original_price', 'image_url', 'status'];

    foreach ($allowedFields as $field) {
        if (isset($input[$field])) {
            if (in_array($field, ['duration_hours'])) {
                $updateData[$field] = intval($input[$field]);
            } elseif (in_array($field, ['price', 'original_price'])) {
                $updateData[$field] = floatval($input[$field]);
            } else {
                $updateData[$field] = $input[$field];
            }
        }
    }

    if (empty($updateData)) {
        throw new Exception('No fields to update');
    }

    // Add updated_at timestamp
    $updateData['updated_at'] = date('c');

    $endpoint = 'courses?id=eq.' . urlencode($id);
    $result = supabaseRequest($endpoint, 'PATCH', $updateData);

    if ($result['code'] === 200) {
        echo json_encode([
            'success' => true,
            'message' => 'Course updated successfully',
            'data' => $result['data'][0] ?? null
        ]);
    } else {
        http_response_code($result['code']);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to update course',
            'details' => $result['data']
        ]);
    }
}

/**
 * Delete a course
 */
function deleteCourse($id)
{
    $endpoint = 'courses?id=eq.' . urlencode($id);
    $result = supabaseRequest($endpoint, 'DELETE');

    if ($result['code'] === 200 || $result['code'] === 204) {
        echo json_encode([
            'success' => true,
            'message' => 'Course deleted successfully'
        ]);
    } else {
        http_response_code($result['code']);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to delete course',
            'details' => $result['data']
        ]);
    }
}
?>