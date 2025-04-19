// prisma/generate-schema.ts

import * as fs from 'fs';
import * as path from 'path';

const TEMPLATE_PATH = 'prisma/schema.prisma.template';
const OUTPUT_PATH = 'prisma/generated/schema.prisma'; // ✅ 여기만 바꿔주면 됨
const DIRECTORIES = ['prisma/enums', 'prisma/models'];

const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
const parts: string[] = [];

for (const dir of DIRECTORIES) {
  const fullDir = path.resolve(dir);

  if (!fs.existsSync(fullDir)) {
    console.warn(`⚠️ Directory not found: ${fullDir}`);
    continue;
  }

  const files = fs
    .readdirSync(fullDir)
    .filter((file) => file.endsWith('.prisma'));

  for (const file of files) {
    const filePath = path.join(fullDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    parts.push(content);
  }
}
if (!fs.existsSync(path.dirname(OUTPUT_PATH))) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
}
const fullSchema = `${template}\n\n${parts.join('\n\n')}`;
fs.writeFileSync(OUTPUT_PATH, fullSchema);

console.log(`✅ schema.prisma generated at ${OUTPUT_PATH}`);
