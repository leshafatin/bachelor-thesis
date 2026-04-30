# Deploy на VPS через Docker и nginx

Этот вариант поднимает:

- `app` — Node/Express приложение
- `nginx` — reverse proxy на `80` порту
- named volume для SQLite БД

## 1. Что поставить на VPS

Для Ubuntu/Debian:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git
sudo systemctl enable --now docker
```

Проверь:

```bash
docker --version
docker compose version
```

## 2. Залить проект на сервер

Пример через `rsync`:

```bash
rsync -av \
  --exclude node_modules \
  --exclude client/dist \
  --exclude server/dist \
  /path/to/diploma/ user@SERVER_IP:/opt/render-lab
```

На сервере:

```bash
ssh user@SERVER_IP
cd /opt/render-lab
```

## 3. Собрать и запустить

```bash
docker compose up -d --build
```

Проверка:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f nginx
curl http://127.0.0.1/healthz
```

Если всё хорошо, приложение будет доступно по:

- `http://SERVER_IP/admin`
- `http://SERVER_IP/page/hello`
- `http://SERVER_IP/page/report`
- `http://SERVER_IP/page/catalog`

## 4. Полезные команды

Пересобрать после изменений:

```bash
docker compose up -d --build
```

Остановить:

```bash
docker compose down
```

Остановить с удалением volume БД:

```bash
docker compose down -v
```

Посмотреть состояние:

```bash
docker compose ps
```

Посмотреть логи приложения:

```bash
docker compose logs -f app
```

## 5. Где лежит база

SQLite хранится в Docker volume `render_lab_data`.

Внутри контейнера путь такой:

```text
/data/db.sqlite
```

Это лучше, чем хранить БД внутри папки приложения, потому что при пересборке контейнера данные не теряются.

## 6. Если нужен домен и HTTPS

Базовый конфиг сейчас слушает только `80` порт и `server_name _;`.

Когда будет домен, можно:

1. заменить `server_name _;` в `deploy/nginx/default.conf` на домен
2. либо поставить Certbot на хосте
3. либо добавить отдельный `nginx-proxy` / `caddy`

Для первой демки научруку текущего варианта обычно достаточно.
