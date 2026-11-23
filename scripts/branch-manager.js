#!/usr/bin/env node
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const action = args[0];

function run(cmd) {
  try {
    return execSync(cmd, { stdio: 'inherit' });
  } catch {
    process.exit(1);
  }
}

switch (action) {
  case 'list': {
    console.log('\n📌 Daftar Branch di Repository Whoosh:\n');
    run('git branch -a');
    console.log('');
    break;
  }

  case 'new': {
    const type = args[1] || 'feat';
    const name = args[2];
    if (!name) {
      console.log('\n❌ Harap masukkan nama branch!');
      console.log('Contoh: npm run branch:new feat ruang-kita-chat\n');
      process.exit(1);
    }
    const branchName = `${type}/${name}`;
    console.log(`\n🚀 Membuat branch baru: ${branchName} dari develop...\n`);
    run('git checkout develop');
    run(`git checkout -b ${branchName}`);
    console.log(`\n✅ Berhasil berpindah ke branch ${branchName}!\n`);
    break;
  }

  case 'switch': {
    const target = args[1];
    if (!target) {
      console.log('\n❌ Harap masukkan nama branch tujuan!');
      console.log('Contoh: npm run branch:switch feat/ruang-kita\n');
      process.exit(1);
    }
    console.log(`\n🔄 Berpindah ke branch ${target}...\n`);
    run(`git checkout ${target}`);
    break;
  }

  default: {
    console.log(`
🛠️  Whoosh Git Branch Manager
-----------------------------------------
Perintah yang tersedia:
  npm run branch:list             - Melihat semua branch lokal & remote
  npm run branch:new <type> <name> - Buat branch baru dari develop (contoh: feat/chat)
  npm run branch:switch <name>     - Pindah ke branch tertentu
`);
    break;
  }
}
