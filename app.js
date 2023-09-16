// Bibliotecas do Node.js (npm)
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Configuração do banco de dados
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 's2livros',
});

// Conexão ao banco de dados
db.connect((err) => {
	if (err) throw err;
	console.log('Conexão ao banco de dados estabelecida!');
});

// Definição do caminho da pasta raiz do projeto (para usar como referência)
const rootPath = path.join(__dirname, 'src');

// Definição do caminho da pasta para as views (templates)
app.set('views', path.join(rootPath, 'views'));

// Definição do mecanismo de visualização como EJS
app.set('view engine', 'ejs');

// Middleware para decodificar o corpo das requisições
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware para servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rota: Tela inicial
app.get('/', (req, res) => {
	res.render('index');
});

// Rota: Adicionar livro (GET)
app.get('/adicionarLivro', (req, res) => {
	res.render('adicionarLivro');
});

// Rota: Adicionar livro (POST)
app.post('/adicionarLivro', (req, res) => {
	const {
		isbn,
		titulo,
		tituloOriginal,
		subtitulo,
		subtituloOriginal,
		autor,
		edicao,
		editora,
		cidade,
		colecao,
		volume,
		assunto,
		tradutor,
		revisor,
		idioma,
		ano,
		paginas,
		resumo,
		custo,
		emprestado,
		lido,
		excluido
	} = req.body;
		if (!isbn || !titulo || !autor || !edicao || !editora || !cidade || !ano || !paginas) {
		return res.status(400).send('Todos os dados do livro são obrigatórios.');
	}
	const query = 'INSERT INTO livros (isbn, titulo, tituloOriginal, subtitulo, subtituloOriginal, autor, edicao, editora, cidade, colecao, volume, assunto, tradutor, revisor, idioma, ano, paginas, resumo, custo, emprestado, lido, excluido) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, 0)';
	const values = [isbn, titulo, tituloOriginal, subtitulo, subtituloOriginal, autor, edicao, editora, cidade, colecao, volume, assunto, tradutor, revisor, idioma, ano, paginas, resumo, custo, emprestado, lido, excluido];
	db.query(query, values, (err, result) => {
		if (err) throw err;
		res.redirect('/listarLivros');
	});
});

// Rota: Livro por ISBN
app.get('/livro', (req, res) => {
	const livroIsbn = req.query.isbn;
	const query = 'SELECT * FROM livros WHERE isbn = ?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) {
			throw err;
		} else {
			if (result && result.length > 0) {
				res.render('livro', { livro: result[0] });
			} else {
				res.render('livroInexistente', { livro: livroIsbn });
			}
		}
	});
});

// Rota: Listar livros cadastrados
app.get('/listarLivros', (req, res) => {
	const query = 'SELECT * FROM livros WHERE excluido = 0 ORDER BY titulo ASC';
	db.query(query, (err, result) => {
		if (err) throw err;
		res.render('listarLivros', { livros: result });
	});
});

// Rota: Listar livros cadastrados
app.get('/listarEmprestados', (req, res) => {
	const query = 'SELECT * FROM livros WHERE emprestado = 1 ORDER BY titulo ASC';
	db.query(query, (err, result) => {
		if (err) throw err;
		res.render('listarEmprestados', { livros: result });
	});
});

// Rota: Lixeira
app.get('/lixeira', (req, res) => {
	const query = 'SELECT * FROM livros WHERE excluido = 1 ORDER BY titulo ASC';
	db.query(query, (err, result) => {
		if (err) throw err;
		res.render('lixeira', { livros: result });
	});
});

// Rota: Restaurar livro
app.get('/restaurar/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const query = 'UPDATE livros SET excluido = 0 WHERE isbn=?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) throw err;
		res.redirect('/lixeira');
	});
});

// Rota: Eliminar livro
app.get('/eliminar/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const query = 'DELETE FROM livros WHERE isbn = ?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) throw err;
		res.redirect('/lixeira');
	});
});

// Rota: Editar livro (GET)
app.get('/editarLivro/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const query = 'SELECT * FROM livros WHERE isbn=?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) throw err;
		res.render('editarLivro', { livro: result[0] });
	});
});

// Rota: Editar livro (POST)
app.post('/editarLivro/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const {
		isbn,
		titulo,
		tituloOriginal,
		subtitulo,
		subtituloOriginal,
		autor,
		edicao,
		editora,
		cidade,
		colecao,
		volume,
		assunto,
		tradutor,
		revisor,
		idioma,
		ano,
		paginas,
		resumo,
		custo
	} = req.body;
	const query = 'UPDATE livros SET isbn=?, titulo=?, tituloOriginal=?, subtitulo=?, subtituloOriginal=?, autor=?, edicao=?, editora=?, cidade=?, colecao=?, volume=?, assunto=?, tradutor=?, revisor=?, idioma=?, ano=?, paginas=?, resumo=?, custo=? WHERE isbn=?';
	db.query(query, [isbn, titulo, tituloOriginal, subtitulo, subtituloOriginal, autor, edicao, editora, cidade, colecao, volume, assunto, tradutor, revisor, idioma, ano, paginas, resumo, custo, livroIsbn], (err, result) => {
		if (err) throw err;
		res.redirect('/listarLivros');
	});
});

// Rota: Editar livro (GET)
app.get('/excluirLivro/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const query = 'UPDATE livros SET excluido = 1 WHERE isbn=?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) throw err;
		res.redirect('/listarLivros');
	});
});

// Rota: Cadastrar devolução (GET)
app.get('/cadastrarDevolucao/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const query = 'UPDATE livros SET emprestado = 0, emprestadoNome="", emprestadoData="", emprestadoPrazo="" WHERE isbn=?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) throw err;
		res.redirect('/listarLivros');
	});
});

// Rota: Cadastrar empréstimo (GET)
app.get('/cadastrarEmprestimo/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const query = 'SELECT * FROM livros WHERE isbn=?';
	db.query(query, [livroIsbn], (err, result) => {
		if (err) throw err;
		res.render('cadastrarEmprestimo', { livro: result[0] });
	});
});

// Rota: Cadastrar empréstimo (POST)
app.post('/cadastrarEmprestimo/:isbn', (req, res) => {
	const livroIsbn = req.params.isbn;
	const {
		isbn,
		emprestado = 1,
		emprestadoNome,
		emprestadoData,
		emprestadoPrazo
	} = req.body;
	const query = 'UPDATE livros SET isbn=?, emprestado=?, emprestadoNome=?, emprestadoData=?, emprestadoPrazo=? WHERE isbn=?';
	db.query(query, [isbn, emprestado, emprestadoNome, emprestadoData, emprestadoPrazo, livroIsbn], (err, result) => {
		if (err) throw err;
		res.redirect('/listarEmprestados');
	});
});

// Rota: Sobre
app.get('/sobre', (req, res) => {
	res.render('sobre');
});

// Log de conexão ao banco de dados
app.listen(port, () => {
	console.log(`Servidor rodando na porta ${port}`);
});