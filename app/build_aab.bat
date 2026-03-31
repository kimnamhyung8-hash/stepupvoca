@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
cd android
gradlew.bat bundleRelease
if not exist "app\release" mkdir "app\release"
copy /y "app\build\outputs\bundle\release\app-release.aab" "app\release\app-release.aab"
cd ..
