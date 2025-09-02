import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { log } from "console";
import { fileURLToPath } from "url";
import { createPostPages } from './createPostPages.js';

/**
 * @param {string} inputDir - 입력 디렉토리 경로
 * @param {string} outputDir - 출력 디렉토리 경로
 * @param {string} baseUrl - 사이트 내 상대 URL 경로 (예: /about)
 * @returns {Array} 폴더/파일 구조 정보
 */
export function convert(inputDir, outputDir, baseUrl = "") {

  const result = [];

  try {
    // outputDir이 존재하지 않는 경우, 폴더 생성
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`출력 디렉토리 생성: ${outputDir}`);
    }
    const entries = fs.readdirSync(inputDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const inputPath = path.join(inputDir, entry.name);
      const outputPath = path.join(outputDir, entry.name);
      log("entry: "+entry.name); 
      
      try {
        if (entry.isDirectory()) {

          //posting 디렉토리를 만날 경우에는 createPostPages()로 처리
          if(entry.name === "posting"){
            log("posting 디렉토리 발견: " + inputPath);
            createPostPages();
            continue;
          }
          const children = convert(inputPath, outputPath, baseUrl + "/" + entry.name);
          result.push({
            type: "dir",
            name: entry.name,
            path: baseUrl + "/" + entry.name,
            children
          });
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const nameWithoutExt = entry.name.replace(/\.md$/, "");
          result.push({
            type: "file",
            name: nameWithoutExt,
            path: baseUrl + "/" + nameWithoutExt,
            fullPath: inputPath
          });
        }
      } catch (err) {
        console.error(`탐색 오류 발생: ${inputPath} → ${err.message}`);
      }
    }
    result.sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));

    for (const item of result) {
      if (item.type === "file") {
        try {
          const md = fs.readFileSync(item.fullPath, "utf-8");

          let htmlContent = marked(md);
          // log("변환 후 ");
          // log(htmlContent);

          // 후처리: a태그의 href 중 .md → .html (앵커/쿼리 유지)
          //   예: href="foo.md#bar" → href="foo.html#bar"
          htmlContent = htmlContent.replace(
            /href="([^"]+?)\.md(\#[^"]*)?"/gi,
            'href="$1.html$2"'
          );
          
          // 👉 HTML 코드 들여쓰기 적용
          const prettyHtml = prettyFormat(htmlContent);



          const finalOutputPath = path.join(outputDir, `${item.name}.html`);
          fs.writeFileSync(finalOutputPath, prettyHtml, "utf-8");
          console.log(`변환 완료: ${item.fullPath} → ${finalOutputPath}`);
        } catch (err) {
          console.error(`변환 오류 발생: ${item.fullPath} → ${err.message}`);
        }
      }
    }

  } catch (err) {
    console.error("변환 오류 발생: ", err.message);
  }

}

export function prettyFormat(html) {
  const tokens = html
    .replace(/></g, ">\n<") // 태그 사이에 줄바꿈 삽입
    .split("\n");
  let indent = 0;
  return tokens
    .map(line => {
      if (/^<\/\w/.test(line)) {
        // 닫는 태그면 들여쓰기 감소
        indent = Math.max(indent - 2, 0);
      }
      const result = " ".repeat(indent) + line.trim();
      if (/^<\w[^>]*[^/]>$/.test(line) && !/^<br/.test(line)) {
        // 여는 태그면 들여쓰기 증가 (단, <br/> 같은 단일 태그 제외)
        indent += 2;
      }
      return result;
    })
    .join("\n");
}


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// // 폴더 내 모든 .html 조각을 읽어 합치기 (재귀)
// function readHtmlFragments(dir) {
//   if (!fs.existsSync(dir)) return "";
//   const files = [];
//   (function walk(d) {
//     for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
//       const full = path.join(d, ent.name);
//       if (ent.isDirectory()) walk(full);
//       else if (ent.isFile() && full.toLowerCase().endsWith(".html")) files.push(full);
//     }
//   })(dir);

//   files.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
//   return files.map((f) => fs.readFileSync(f, "utf-8")).join("\n");
// }

// /** 템플릿의 placeholder를 섹션별 HTML로 치환하여 result/index.html 생성 */
// export function buildPages() {
//   const baseDir = __dirname;

//   // 템플릿 읽기
//   const templatePath = path.join(baseDir, "template1Marked.html");
//   const template = fs.readFileSync(templatePath, "utf-8");

//   // 섹션 폴더에서 조각 읽기 (result/ 기준)
//   const resultDir = path.join(baseDir, "result");
//   const postsHtml    = readHtmlFragments(path.join(resultDir, "posts"));
//   const projectsHtml = readHtmlFragments(path.join(resultDir, "projects"));
//   const skillsHtml   = readHtmlFragments(path.join(resultDir, "skills"));


//   log(skillsHtml);

//   const projectsHtmlList = extractProjects(projectsHtml);
//   log(projectsHtmlList);

//   // placeholder 치환(공백 허용, 전역 치환)
//   let html = template
//     .replace(/{{\s*posts\s*}}/g, postsHtml)
//     .replace(/{{\s*projects\s*}}/g, projectsHtmlList)
//     .replace(/{{\s*skills\s*}}/g, skillsHtml);

//   // 출력: result/index.html
//   fs.mkdirSync(resultDir, { recursive: true });
//   fs.writeFileSync(path.join(resultDir, "index.html"), html, "utf-8");
//   console.log(`✅ Built: ${path.join(resultDir, "index.html")}`);
// }


// function extractProjects(htmlString) {
//   // <h3>로 시작해서 </ul>로 끝나는 블록을 모두 찾기
//   const regex = /<h3[\s\S]*?<\/ul>/g;
//   const matches = (htmlString.match(regex) || [])
//                     .map(block => `<article class="card">\n${block}\n</article>`)
//                     .join("\n");

//   return matches;
// }

