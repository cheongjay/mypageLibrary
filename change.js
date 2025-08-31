import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

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

      try {
        if (entry.isDirectory()) {
          const children = convert(inputPath, outputPath, baseUrl + "/" + entry.name);
          result.push({
            type: "dir",
            name: entry.name,
            path: baseUrl + "/" + entry.name,
            children
          });
        } else if (entry.isFile() && /\.md$/i.test(entry.name)) { // ← 대소문자 무관
          const nameWithoutExt = entry.name.replace(/\.md$/i, "");
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

    for (const item of result) {
      if (item.type === "file") {
        try {
          const md = fs.readFileSync(item.fullPath, "utf-8");

          let htmlContent = marked(md);

          // 후처리: a태그의 href 중 .md → .html (앵커/쿼리 유지)
          //   예: href="foo.md#bar" → href="foo.html#bar"
          htmlContent = htmlContent.replace(
            /href="([^"]+?)\.md(\#[^"]*)?"/gi,
            'href="$1.html$2"'
          );

          const finalOutputPath = path.join(outputDir, `${item.name}.html`);
          fs.writeFileSync(finalOutputPath, htmlContent, "utf-8");
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
