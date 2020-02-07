# Introduction
최신 버전의 ```RPG Maker MV v1.6.2```를 사용하면, ES6 등의 사용이 자유롭지만 ```RPG Maker MV v1.5.2``` 이하의 구 버전에서는 오류로 구동이 되지 않는 경우가 많습니다. 이 툴은 상단 툴바에 구 버전 플레이어로 게임을 플레이할 수 있는 플레이 버튼을 추가합니다.

# How to use
별도의 설치 프로그램은 없으며 기존에 만든 ```ToolManager```(```Python```과 ```Node.js```로 작성한 소스)에 의존합니다.

1. 다음 프로그램이 있어야 하며 환경 변수 ```PATH```에 등록되어있어야 합니다.

    * Python 2.7
    * Node.js

2. ```Git```을 통해 이 저장소를 내려 받거나, 압축된 파일을 다운로드 받아서 풀고 ```MV/nwjs/nwjs-v0.12.3-win-ia32/``` 폴더로 이동합니다 (```git```을 이용하여 업데이트 하면 편리합니다)

3. ```add.bat``` 파일을 실행합니다.

4. ```RPG Maker MV```를 재실행하면 ES5 Player가 추가됩니다.