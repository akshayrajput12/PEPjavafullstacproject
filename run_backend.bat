@echo off
set "JAVA_HOME=C:\Program Files\Java\jdk-25.0.2"
set "MAVEN_OPTS=-Dmaven.wagon.http.ssl.insecure=true -Dmaven.wagon.http.ssl.allowall=true -Dmaven.wagon.http.ssl.ignore.validity.dates=true"
.\mvnw.cmd spring-boot:run
