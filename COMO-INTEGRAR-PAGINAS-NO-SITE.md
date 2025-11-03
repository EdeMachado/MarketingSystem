# 🔌 COMO INTEGRAR PÁGINAS SEO NO SEU SITE

## ✅ API JÁ CRIADA!

Agora você tem 3 formas de usar as páginas no seu site:

---

## 📋 OPÇÕES DISPONÍVEIS

### 1. **HTML Completo** (Para usar em iframe ou página separada)
```
GET /api/seo/pages/slug/:slug/html
```

Retorna página HTML completa e pronta, com:
- ✅ Meta tags (title, description, keywords)
- ✅ Estrutura HTML completa
- ✅ Estilos CSS embutidos
- ✅ Pronto para usar!

---

### 2. **Apenas Conteúdo** (Para integrar no seu site)
```
GET /api/seo/pages/slug/:slug/content
```

Retorna apenas o conteúdo HTML (sem `<html>`, `<head>`, etc):
- ✅ Só o conteúdo da página
- ✅ Você controla o design do seu site
- ✅ Ideal para integrar no layout existente

---

### 3. **Lista de Páginas** (Para criar menu dinâmico)
```
GET /api/seo/pages/list
```

Retorna lista de todas as páginas:
- ✅ Título, slug, URL
- ✅ Status (draft, ready, published)
- ✅ Data de criação/atualização

---

## 🚀 COMO USAR NO SEU SITE

### **Opção A: Iframe Simples** (Mais Fácil - 5 minutos)

**1. No seu site (qualquer página HTML):**
```html
<!-- Exemplo: Página sobre "Saúde Ocupacional" -->
<iframe 
  src="http://localhost:3001/api/seo/pages/slug/saude-ocupacional/html"
  style="width: 100%; min-height: 600px; border: none;"
  frameborder="0"
></iframe>
```

**2. Em produção, troque `localhost:3001` pelo seu servidor:**
```html
<iframe 
  src="https://seu-backend.com/api/seo/pages/slug/saude-ocupacional/html"
  style="width: 100%; min-height: 600px; border: none;"
></iframe>
```

**✅ Pronto!** A página aparece automaticamente!

---

### **Opção B: JavaScript/AJAX** (Mais Profissional)

**1. No seu site:**
```html
<div id="seo-page-content"></div>

<script>
  const slug = 'saude-ocupacional'; // Pode vir de URL, variável, etc
  const apiUrl = `http://localhost:3001/api/seo/pages/slug/${slug}/content`;
  
  fetch(apiUrl)
    .then(res => res.text())
    .then(html => {
      document.getElementById('seo-page-content').innerHTML = html;
    })
    .catch(err => {
      console.error('Erro ao carregar página:', err);
      document.getElementById('seo-page-content').innerHTML = 
        '<p>Erro ao carregar conteúdo.</p>';
    });
</script>
```

**Vantagem:** Controle total sobre estilo, SEO melhor!

---

### **Opção C: PHP/Server-Side** (Para sites com backend)

**Exemplo PHP:**
```php
<?php
$slug = $_GET['slug'] ?? 'saude-ocupacional';
$apiUrl = "http://localhost:3001/api/seo/pages/slug/{$slug}/content";
$content = file_get_contents($apiUrl);
echo $content;
?>
```

**Exemplo Node.js/Express:**
```javascript
app.get('/pagina/:slug', async (req, res) => {
  const { slug } = req.params;
  const response = await fetch(`http://localhost:3001/api/seo/pages/slug/${slug}/content`);
  const content = await response.text();
  res.send(content);
});
```

---

### **Opção D: WordPress Shortcode** (Para WordPress)

**1. Criar plugin simples** (`wp-content/plugins/seo-pages/seo-pages.php`):
```php
<?php
/**
 * Plugin Name: SEO Pages Integration
 * Description: Integra páginas SEO do sistema de marketing
 */

function render_seo_page($atts) {
  $slug = $atts['slug'] ?? 'saude-ocupacional';
  $apiUrl = "http://localhost:3001/api/seo/pages/slug/{$slug}/content";
  
  $response = wp_remote_get($apiUrl);
  
  if (is_wp_error($response)) {
    return '<p>Erro ao carregar conteúdo.</p>';
  }
  
  return wp_remote_retrieve_body($response);
}

add_shortcode('seo_page', 'render_seo_page');
```

**2. No WordPress, usar:**
```
[seo_page slug="saude-ocupacional"]
```

**✅ Pronto!** A página aparece onde você colocar o shortcode!

---

## 🎯 EXEMPLOS PRÁTICOS

### **Exemplo 1: Página única no seu site**

**Seu site:** `grupobiomed.com.br/saude-ocupacional`

**Solução:**
1. Criar rota/página no seu site que chama a API
2. Ou usar iframe diretamente

---

### **Exemplo 2: Múltiplas páginas**

**Seu site:** `grupobiomed.com.br/blog/exame-admissional`

**Solução:**
1. Criar sistema de rotas dinâmicas
2. Cada rota chama API com slug correspondente

---

### **Exemplo 3: Menu dinâmico**

**Criar menu automaticamente com todas as páginas:**

```javascript
// Buscar lista de páginas
fetch('http://localhost:3001/api/seo/pages/list')
  .then(res => res.json())
  .then(data => {
    const menu = document.getElementById('menu');
    
    data.data.forEach(page => {
      if (page.status === 'published') {
        const link = document.createElement('a');
        link.href = `/${page.slug}`;
        link.textContent = page.title;
        menu.appendChild(link);
      }
    });
  });
```

---

## ⚙️ CONFIGURAÇÃO EM PRODUÇÃO

### **1. Alterar URL da API**

No seu site, troque:
```javascript
const apiUrl = `http://localhost:3001/api/seo/pages/slug/${slug}/content`;
```

Por:
```javascript
const apiUrl = `https://seu-backend.com/api/seo/pages/slug/${slug}/content`;
```

### **2. Configurar CORS (se necessário)**

O backend já permite CORS, mas se precisar configurar domínios específicos:
```env
CORS_ORIGIN=https://grupobiomed.com.br
```

---

## 🔒 SEGURANÇA (Opcional)

### **1. Autenticação (se quiser proteger)**

Adicionar token na requisição:
```javascript
fetch(apiUrl, {
  headers: {
    'Authorization': 'Bearer seu-token-aqui'
  }
})
```

### **2. Cache (para performance)**

Cachear conteúdo por algumas horas:
```javascript
// Verificar cache primeiro
const cacheKey = `seo-page-${slug}`;
const cached = localStorage.getItem(cacheKey);

if (cached) {
  const { content, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp < 3600000) { // 1 hora
    return content;
  }
}

// Buscar da API
fetch(apiUrl)
  .then(res => res.text())
  .then(html => {
    localStorage.setItem(cacheKey, JSON.stringify({
      content: html,
      timestamp: Date.now()
    }));
    return html;
  });
```

---

## ✅ RESUMO

**O que você precisa fazer:**

1. ✅ **Escolher uma opção** (A, B, C ou D)
2. ✅ **Colar o código** no seu site
3. ✅ **Trocar `localhost:3001`** pelo seu servidor em produção
4. ✅ **Testar** criando uma página SEO no sistema

**Tempo estimado:** 5-15 minutos (dependendo da opção)

**Quer ajuda para implementar alguma opção específica?** 🚀


