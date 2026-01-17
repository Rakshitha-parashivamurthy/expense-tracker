## MongoDB: Running a second local instance (port 27018)

This document explains how to start a second local `mongod` instance for this project and how to connect to it. Use these instructions on Windows PowerShell.

- **Data directory:** `C:\data\db2`
- **Port:** `27018`
- **Project `.env` setting:** `MONGO_URI=mongodb://127.0.0.1:27018/expense_tracker`

1) Start using the helper script

 - If you added the helper script, run it and pass the full path to `mongod.exe` if needed:

```powershell
.\backend\start-mongo-27018.ps1 'C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe'
```

 - Or run without arguments so the script tries common install paths:

```powershell
.\backend\start-mongo-27018.ps1
```

2) Run `mongod` directly (full path recommended)

 - Locate `mongod.exe` (example common path):

```powershell
Get-ChildItem 'C:\Program Files','C:\Program Files (x86)' -Filter mongod.exe -Recurse -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty FullName
```

 - Start using the full path (replace example path with yours):

```powershell
& 'C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe' --dbpath 'C:\data\db2' --port 27018
```

 - To run detached (background):

```powershell
Start-Process -FilePath 'C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe' -ArgumentList '--dbpath','C:\data\db2','--port','27018'
```

3) Add MongoDB `bin` to your PATH (optional)

 - Replace the path below with the `bin` folder that contains `mongod.exe`:

```powershell
setx PATH "$env:PATH;C:\Program Files\MongoDB\Server\6.0\bin"
```

 - Close and reopen PowerShell to pick up the change. After reopening, `mongod` should be callable directly.

4) Docker alternative (if you have Docker installed)

 - Run a MongoDB container mapped to host port 27018 and persist data to `C:\data\db2`:

```powershell
docker run -d --name mongo-27018 -p 27018:27017 -v C:\data\db2:/data/db mongo:6.0
```

 - With Docker, keep `MONGO_URI=mongodb://127.0.0.1:27018/expense_tracker` in `.env`.

5) Verification & Troubleshooting

 - Check the port is listening:

```powershell
netstat -an | Select-String ':27018'
```

 - Check Task Manager for `mongod.exe`.
 - If you get a permission error, run PowerShell as Administrator.
 - If port 27018 is already in use, choose a different port and update `backend/.env`.

6) Reverting `.env`

 - Restore backup if needed:

```powershell
Copy-Item backend\.env.backup backend\.env -Force
```

If you'd like, I can also add a `docker-compose.yml` for a MongoDB service, or create a small PowerShell shortcut that sets PATH for your current shell session. Tell me which you prefer.
