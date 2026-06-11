@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    https://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM Begin all REM://
@echo off
@REM set title of command window
title %0
@REM enable extensions
setlocal enableextensions enabledelayedexpansion

set WRAPPER_VERSION=3.2.0
set MVNW_VERBOSE=false

@REM Determine the Java command to use to start the JVM.
set JAVA_EXE=java.exe
if not "%JAVA_HOME%"=="" (
    if exist "%JAVA_HOME%\bin\java.exe" set JAVA_EXE=%JAVA_HOME%\bin\java.exe
)
%JAVA_EXE% -version >NUL 2>&1
if not "%ERRORLEVEL%"=="0" (
    echo Error: JAVA_HOME is not defined, and no "java" command could be found in your PATH. >&2
    goto error
)

set WRAPPER_JAR="%~dp0\.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/%WRAPPER_VERSION%/maven-wrapper-%WRAPPER_VERSION%.jar"

if exist %WRAPPER_JAR% (
    if "%MVNW_VERBOSE%"=="true" echo Found %WRAPPER_JAR%
) else (
    if "%MVNW_VERBOSE%"=="true" echo Couldn't find %WRAPPER_JAR%, downloading it ...

    @REM Download using PowerShell
    powershell -Command "&{"^
        "param($uri,$out);"^
        "if (-not (Test-Path -Path (Split-Path $out))) {"^
        "    New-Item -ItemType Directory -Path (Split-Path $out) -Force | Out-Null"^
        "}"^
        "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;"^
        "Invoke-WebRequest -Uri $uri -OutFile $out"^
        "}" %WRAPPER_URL% %WRAPPER_JAR%
    if "%MVNW_VERBOSE%"=="true" echo Finished downloading %WRAPPER_JAR%
)

@REM Provide a "standardized" way to retrieve the CLI args that will
@REM work with both Windows and non-Windows executions.
set MAVEN_CMD_LINE_ARGS=%*

set WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

%JAVA_EXE% ^
  %JVM_CONFIG_MAVEN_PROPS% ^
  %MAVEN_OPTS% ^
  -cp %WRAPPER_JAR% ^
  "-Dmaven.multiModuleProjectDirectory=%~dp0" ^
  %WRAPPER_LAUNCHER% %MAVEN_CMD_LINE_ARGS%

if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%

cmd /C exit /B %ERROR_CODE%
