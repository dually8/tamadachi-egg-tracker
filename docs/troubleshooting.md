## SQLITE Error (Read only Database)


```
⨯ SqliteError: attempt to write a readonly database
    at _.run (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:34:22406)
    at QueryPromise.run (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:34:8513)
    at Function.<anonymous> (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:22:76128)
    at Z.transaction (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:34:21690)
    at aa.transaction (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:34:19477)
    at e (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:22:76037)
    at f (.next/server/chunks/ssr/[root-of-the-server]__9aae0b5f._.js:35:423) {
  code: 'SQLITE_READONLY',
  digest: '1540628542'
}
```

```
sudo chown -R 1001:1001 /path/to/tamadachi-egg-tracker/data
sudo chmod 755 /path/to/tamadachi-egg-tracker/data
sudo chmod 664 /path/to/tamadachi-egg-tracker/data/local.db
cd /path/to
docker compose restart eggtracker
```