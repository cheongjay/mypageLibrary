## 우리 라이브러리 설명 쓰기

## 라이브러리명

## 디렉토리 설명
profile - md 파일 모아놓은 최상위 디렉토리
profile > posting - 포스팅할 md 파일 모아놓은 디렉토리

result - md 파일들이 html로 변환되어 저장되는 최상위 디렉토리
result > posting - 포스팅할 html 파일 모아놓은 디렉토리

## 기본 파일들 설명
result/posting/postMainTemplate.html - 포스팅 html 파일들을 리스트 형태로 보여주는 페이지 템플릿

    {{ postList }} 플레이스 홀더에 profile/posting에 있는 md 파일들이 html로 변환되어 위치하는 곳.
    수정 시 파싱이 안 되므로 이 부분은 수정 x
    나머지 부분은 자유롭게 코드 추가 가능


result/posting/postMain.html - 변환 후 포스팅 html 파일들을 리스트 형태로 보여주는 결과 페이지

result/posting/postDetailTemplate.html - 하나의 포스팅 html 파일의 전체 내용을 보여주는 페이지


### postMainTemplate.html - {{ postList }} 에 posting
### postDetailTemplate.html - {{ postDetail }}

### css 추가하고 싶다면? ~Template.html 형식의 html파일에 추가하기