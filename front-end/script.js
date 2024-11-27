const crudUrl = '../back-end/crud.php';
const apiKey = '4GeEQXy0ttFKtsEC9NbVGmSpc66VLa84';

const topStoriesUrl = `https://api.nytimes.com/svc/topstories/v2/home.json?api-key=${apiKey}`;
const mostPopularUrl = `https://api.nytimes.com/svc/mostpopular/v2/viewed/7.json?api-key=${apiKey}`;

const articlesPerPage = 6;
let page = 0;

window.articles = [];

async function fetchTopStories() {
  try {
    const response = await fetch(topStoriesUrl);
    const data = await response.json();
    window.articles = data.results; 
    displayFeaturedArticle(data.results[0]); 
    displayArticles(data.results.slice(1));  
  } catch (error) {
    console.error('Erro ao buscar top stories:', error);
  }
}

function displayFeaturedArticle(article) {
  const featuredArticle = document.getElementById('featured-article');
  featuredArticle.innerHTML = `
    <h3>${article.title}</h3>
    <p>${article.abstract}</p>
    <a href="${article.url}" target="_blank">Read more</a>
  `;
}

function displayArticles(articles) {
  const articleContainer = document.getElementById('articles');
  const start = page * articlesPerPage;
  const end = start + articlesPerPage;
  const articlesToShow = articles.slice(start, end);

  articlesToShow.forEach((article) => {
    const articleEl = document.createElement('article');
    articleEl.innerHTML = `
      <h3>${article.title}</h3>
      <p>${article.abstract}</p>
    `;
    articleContainer.appendChild(articleEl);
  });

  page++;
}

document.getElementById('load-articles').addEventListener('click', () => {
  if (window.articles && window.articles.length > page * articlesPerPage) {
    displayArticles(window.articles);
  } else {
    alert('Todos os artigos foram carregados.');
  }
});

document.getElementById('send-to-back').addEventListener('click', async () => {
  if (!window.articles || window.articles.length === 0) {
    alert('Nenhum artigo carregado. Busque os artigos primeiro.');
    return;
  }

  try {
    console.log(window.articles[0])
    const response = await fetch(crudUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles: window.articles })
    });

    if (!response.ok) {
      throw new Error(`Erro no envio: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Resposta do servidor:', result);
    alert(result.message || 'Artigos enviados com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar artigos:', error);
    alert('Falha ao enviar os artigos. Verifique o console para mais detalhes.');
  }
});

// Botão para Listar Salvos
document.getElementById("list-saved").addEventListener("click", async () => {
  try {
    const response = await fetch(crudUrl, { method: "GET" });
    const savedArticles = await response.json();

    const savedContainer = document.getElementById("saved-container");
    savedContainer.innerHTML = ""; // Limpar conteúdo antigo

    savedArticles.articles.forEach((article) => {
      const articleEl = document.createElement("article");
      articleEl.innerHTML = `
        <h3>${article.title}</h3>
        <p>${article.abstract}</p>
        <button class="delete-article" data-id="${article.id}">Deletar</button>
        <button class="update-article" data-id="${article.id}">Editar</button>
      `;
      savedContainer.appendChild(articleEl);
    });

    document.querySelectorAll(".update-article").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await handleEdit(id); // Função para lidar com a edição
      });
    });

    // Adicionar evento de exclusão
    document.querySelectorAll(".delete-article").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const id = e.target.dataset.id;
        await deleteArticle(id);
        e.target.parentElement.remove(); // Remover o elemento do DOM
      });
    });

    document.getElementById("featured-article").style.display = "none";
    document.querySelector(".news-list").style.display = "none";
    document.getElementById("edit-article").style.display = "none";
    document.getElementById("saved-articles").style.display = "block";
  } catch (error) {
    console.error("Erro ao listar artigos salvos:", error);
  }
});

async function handleEdit(id) {
  console.log("ID do artigo para edição:", id);

  try {
    const response = await fetch(`${crudUrl}/${id}`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar artigo: ${response.statusText}`);
    }
    const article = await response.json();

    // Preencher os campos do formulário
    document.getElementById("saved-articles").style.display = "none";
    document.getElementById("featured-article").style.display = "none";
    document.getElementById("edit-article").style.display = "block";

    document.getElementById("article-title").value = article.article.title || "";
    document.getElementById("article-content").value = article.article.abstract || "";
    document.getElementById("edit-form").dataset.id = id;
  } catch (error) {
    console.error("Erro ao buscar artigo para edição:", error);
  }
}

// Submeter Formulário de Edição
document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = (e.target.dataset.id);
  const title = document.getElementById("article-title").value;
  const abstract = document.getElementById("article-content").value;

  try {
    const response = await fetch(`${crudUrl}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, abstract }),
    });

    if(response.ok){
      alert("Artigo atualizado com sucesso!");

      document.getElementById("list-saved").click();
    }
  } catch (error) {
    console.error("Erro ao atualizar artigo:", error);
  }
});

// Função para Deletar Artigo
async function deleteArticle(id) {
  try {
    const response = await fetch(`${crudUrl}/${id}`, { method: "DELETE" });
    const result = await response.json();
    alert(result.message || "Artigo deletado com sucesso!");
  } catch (error) {
    console.error("Erro ao deletar artigo:", error);
  }
}

fetchTopStories()