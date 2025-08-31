## 준비물
카드, 뱃지, ..... 샘플 md, customTemplateSample.html

## make~
-> css와 매칭될 수 있게 속성들 붙여주는 로직? <class="">
-> makeCard면 <class="card"> 가 들어가도록.
<!-- -> 한 파일에 매칭할 요소들 집어넣기
-> 카드 디자인에 맞는 내용들에 맞게 md 파일을 잘 작성했는지? -->
-> makeCard(파일명.md); // 파일명을 식별자로 설정해서 buildPages에서 매핑할 때 파일명과 일치하는 식별자를 customTemplateHtml에서 찾아서 매핑한다.

## start.js
cards, bedges -> 모든 md들은 카드라는 디자인으로 만들어질 예정
cards > projects.md, posts.md
bedges > skills.md, keywords.md


convert(srcDir, destDir); -> 이 안에서 makeCard를 수행할 시.. md 파일 맨 위에 card인지, bedge인지 식별할 수 있게..
<!-- result > cards, bedges
cards > pro~~.html, posts.html
bedges > ~~ -->

makeCard(result/cards); -> cards 라는 디렉토리 안에 html은 모두 card 속성이 적용되게, 변경사항을 기존 html에 반영, 덮어쓰기
makeBedge(result/bedges); -> 마찬가지로 뱃지 속성이 모두 적용되게

createPages(result); -> 안의 html들을 모두 읽어서 customTem~~.html에 html 파일명과 맞는 곳에 코드를 매핑하고, 최종 결과를 index.html로 만들어준다.

<!-- buildPages(); -->
