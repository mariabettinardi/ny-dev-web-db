<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if ($method === 'POST') {
    // CREATE - Insere novos artigos
    if (!is_array($data) || empty($data['articles'])) {
        http_response_code(400);
        echo json_encode(['message' => 'Nenhum dado válido foi enviado.']);
        exit;
    }

    $query = "INSERT INTO articles (title, url, byline, published_date, abstract) 
              VALUES (:title, :url, :byline, :published_date, :abstract)";
    $stmt = $pdo->prepare($query);

    $errors = [];
    $successCount = 0;

    foreach ($data['articles'] as $article) {
        if (!isset($article['title']) || empty($article['title']) ||
            !isset($article['url']) || empty($article['url']) ||
            !isset($article['published_date']) || empty($article['published_date'])) {
            $errors[] = "Artigo inválido: Campos obrigatórios ausentes ou vazios. Dados: " . json_encode($article);
            continue;
        }

        $byline = $article['byline'] ?? 'Unknown';

        try {
            $stmt->execute([
                ':title' => $article['title'],
                ':url' => $article['url'],
                ':byline' => $byline,
                ':abstract' => $article['abstract'],
                ':published_date' => $article['published_date']
            ]);
            $successCount++;
        } catch (PDOException $e) {
            $errors[] = "Erro ao salvar o artigo: {$article['title']}. Mensagem: " . $e->getMessage() . json_encode($article);
        }
    }

    echo json_encode([
        'message' => "Processamento concluído.",
        'success' => $successCount,
        'errors' => $errors
    ]);

}elseif ($method === 'GET') {
    // READ - Recupera artigos
    try {
        $uri = $_SERVER['REQUEST_URI'];
        $parts = explode('/', $uri);
        $id = end($parts);
        
        if (!is_numeric($id)) {
            // Caso não seja um id numérico, recupere todos os artigos
            $query = "SELECT * FROM articles";
            $stmt = $pdo->query($query);
            $articles = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'message' => 'Artigos recuperados com sucesso.',
                'articles' => $articles
            ]);   
        } else {
            // Caso seja um id numérico, recupere o artigo específico
            $query = "SELECT * FROM articles WHERE id = :id";
            $stmt = $pdo->prepare($query);
            $stmt->execute([':id' => $id]);
            $article = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($article) {
                echo json_encode([
                    'message' => 'Artigo recuperado com sucesso.',
                    'article' => $article
                ]);
            } else {
                echo json_encode([
                    'message' => 'Artigo não encontrado.'
                ]);
            }
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Erro ao recuperar os artigos. ' . $e->getMessage()]);
    }
} elseif ($method === 'PUT') {
    // UPDATE - Atualiza um artigo
    $uri = $_SERVER['REQUEST_URI'];
    $parts = explode('/', $uri);
    $id = end($parts);
    echo json_encode($data);
    if (!is_numeric($id) ||
        !isset($data['title']) || empty($data['title']) ||
        !isset($data['abstract']) || empty($data['abstract']) ) {
        http_response_code(400);
        echo json_encode(['message' => 'Campos obrigatórios ausentes para a atualização.']);
        exit;
    }

    $query = "UPDATE articles 
              SET title = :title, abstract = :abstract
              WHERE id = :id";
    $stmt = $pdo->prepare($query);

    try {
        $stmt->execute([
            ':id' => $id,
            ':title' => $data['title'],
            ':abstract' => $data['abstract']
        ]);

        echo json_encode(['message' => 'Artigo atualizado com sucesso.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Erro ao atualizar o artigo. ' . $e->getMessage()]);
    }

} elseif ($method === 'DELETE') {
    // DELETE - Remove um artigo
    $uri = $_SERVER['REQUEST_URI'];
    $parts = explode('/', $uri);
    $id = end($parts);
    if (!isset($id) || empty($id)) {
        http_response_code(400);
        echo json_encode(['message' => 'ID do artigo é obrigatório para exclusão.']);
        exit;
    }

    $query = "DELETE FROM articles WHERE id = :id";
    $stmt = $pdo->prepare($query);

    try {
        $stmt->execute([':id' => $id]);
        echo json_encode(['message' => 'Artigo excluído com sucesso.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['message' => 'Erro ao excluir o artigo. ' . $e->getMessage()]);
    }

} else {
    // Método não suportado
    http_response_code(405);
    echo json_encode(['message' => 'Método não permitido.']);
}
?>
