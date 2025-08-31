
import fs from "fs";
import path from "path";
import { marked } from "marked";
import { fileURLToPath } from "url";
import { log } from "console";



// 사용자가 줘야 하는 파일 경로
// const inputPath = 'profile';
// const outputPath = 'result';

// npm 명령어로 파일 경로 넘겨주기 - npm start inputPath outputPath
// const [inputPath, outputPath] = process.argv.slice(2);

// // 사용자가 호출해야 하는 메소드 형식? 아니면 npm start.js 하면 알아서 다 되게?
// // convert(path.resolve(inputPath), path.resolve(outputPath));
// convert(inputPath,outputPath);

// 이 코드는 convert.js 파일이 실행되는 그 디렉토리 경로를 파일 포함해서 가지고 옴.
// 가령 file:///C:/Users/cheongjay/Desktop/우리fisa/mypage/convert.js
// 그래서 만약 npm 으로 다운 받게 되면, 사용자 코드가 있는 디렉토리 경로가 아니라
// 우리 npm 라이브러리 경로가 가져와져서 경로를 못 찾을 것으로 예상됨. (아직 해본 건 아님..) 결론은 쓰지 말자?
// const filename = fileURLToPath(import.meta.url);

// dirname() - 경로 문자열에서 '디렉토리'부분만 추출해주는 메소드
// 위 예시대로라면 file:///C:/Users/cheongjay/Desktop/우리fisa/mypage 가 됨
// const dirname = path.dirname(filename);


export function convert(inputPath, outputPath, baseUrl = "" ){
    
    
    if(!fs.existsSync(outputPath)){
        fs.mkdirSync(outputPath, {recursive: true});
    }

    const entries = fs.readdirSync(inputPath, {withFileTypes: true});
    const result = [];

    for(const entry of entries){
        if(entry.isDirectory()){
            const children = convert(path.join(inputPath, entry.name), path.join(outputPath, entry.name), baseUrl +"/" + entry.name);

            result.push({
                type: "dir",
                name: entry.name,
                path: baseUrl + "/" + entry.name,
                children,
            });
        }
        else if(entry.isFile() && entry.name.endsWith(".md")){
            const nameWithoutExt = entry.name.replace(/\.md$/,"");
            result.push({
                type: "file",
                name: nameWithoutExt,
                path: baseUrl + "/" + nameWithoutExt,
                fullPath: path.join(inputPath, entry.name),
            });
        }
    }
    result.sort((a,b) => a.name.localeCompare(b.name, "en", { numeric: true }));
    
    result.forEach((file) =>{
        if(file.type === "file"){
            const md = fs.readFileSync(file.fullPath, "utf-8");
            const html = marked(md);
            fs.writeFileSync(path.join(outputPath, `${file.name}.html`), html, 'utf-8'); 
        }
    })
    
    return result;
}
