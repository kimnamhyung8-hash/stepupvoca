@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
cd android
gradlew.bat bundleRelease
cd ..
if not exist "release" mkdir "release"
copy /y "android\app\build\outputs\bundle\release\app-release.aab" "release\app-release.aab"
