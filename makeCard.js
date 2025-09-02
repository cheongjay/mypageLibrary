import { read } from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from 'path';
import fs from 'fs';
import { log } from "console";

export function makeCard(dirPath){
    // 해당 경로의 폴더들 모두 읽기
    log("makeCard 실행 시작")
    log(dirPath);
    if (!fs.existsSync(dirPath)) {
        log("없음")
        return [];
    }
    // 디렉토리 존재할 경우에, 그 안에 있는 것들 읽기 시작
    const files = fs.readdirSync(dirPath)
        .filter(f => f.endsWith(".html")); // 디렉토리 제외하고, html로 끝나는 파일들만 필터링
    log("files: " + files); // 파일들이 여러 개 있을 수 있으므로, [] 로 저장
    
    // 파일 이름을 기준으로 template에다가 매핑해야 하기 때문에, name과 content 속성을 설정
    // name - html 파일의 이름
    // content - html 파일 내용물
    files.map(f => {
        const filePath = path.join(dirPath, f);
        const rawContent = fs.readFileSync(filePath, "utf-8");
        const cardContent = addCardAttribute(rawContent);
        log(filePath);
        fs.writeFileSync(filePath, cardContent, "utf-8");

        // return{
        //     name: path.basename(f, ".html"),
        //     content: fs.readFileSync(path.join(dirPath, f), "utf-8")
        // };


    });
    // 카드 속성 붙이기


}


function addCardAttribute(htmlString) {
    // <h3>로 시작해서 </ul>로 끝나는 블록을 모두 찾기
    const regex = /<h3[\s\S]*?<\/ul>/g;
    const matches = (htmlString.match(regex) || [])
        .map(block => `<article class="card">\n${block}\n</article>`)
        .join("\n");

    return matches;
}