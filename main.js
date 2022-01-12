class CommandPrompt {
  constructor(options) {
    this.user = options?.user || 'mystpi';
    this.host = options?.host || 'laptop';
    this.dir = options?.dir || '~/';
    this.cursorStyle = options?.cursor || '█';

    this.newLine();
  }

  newLine() {
    this.hideCursor();

    const p = document.createElement('p');
    p.className = 'font-mono text-gray-500';

    const host = document.createElement('span');
    host.className = 'text-emerald-500';
    host.innerText = `${this.user}@${this.host}`;

    const dir = document.createElement('span');
    dir.className = 'text-amber-500';
    dir.innerText = this.dir;

    const text = document.createElement('span');
    this.text = text;

    const cursor = document.createElement('span');
    cursor.className = 'text-gray-400';
    cursor.innerText = this.cursorStyle;
    this.cursor = cursor;

    p.appendChild(host);
    p.innerHTML += ':';
    p.appendChild(dir);
    p.innerHTML += '$ ';
    p.appendChild(this.text);
    p.appendChild(cursor);
    document.body.appendChild(p);
    p.scrollIntoView({ behavior: 'smooth' });
  }

  write(text, timeout, wait) {
    return new Promise((resolve, reject) => {
      text = text.replace(/\n/g, '<br>');
      for (let i = 0; i < text.length; i++) {
        setTimeout(() => {
          this.text.innerHTML += text[i];
        }, i * (timeout || 100));
      }
      setTimeout(async () => {
        await this.wait(wait || 250);
        resolve();
      }, text.length * (timeout || 100));
    });
  }

  output(text) {
    text = text.replace(/\n/g, '<br>');
    this.text.innerHTML += '<br>' + text;
    this.hideCursor();
  }

  hideCursor() {
    if (this.cursor) this.cursor.style.display = 'none';
  }

  tree(dir, links) {
    let ret = dir + '<br>';
    for (let i = 0; i < links.length; i++) {
      let link = links[i];
      if (i == links.length - 1) {
        if (link.url) {
          ret += `└── <a class="underline text-blue-500 font-bold" href="${link.url}" target="_blank">${link.name}</a>`;
        } else {
          ret += `└── ${link.name}`;
        }
      } else {
        if (link.url) {
          ret += `├── <a class="underline text-blue-500 font-bold" href="${link.url}" target="_blank">${link.name}</a><br>`;
        } else {
          ret += `├── ${link.name}<br>`;
        }
      }
    }
    ret += '<br><br>';
    this.output(ret);
  }

  wait = (timeout) => new Promise((resolve, reject) => setTimeout(resolve, timeout));
}


async function main() {
  const mystpi = await fetch('https://api.github.com/users/MystPi').then(res => res.json());
  const repos = await fetch('https://api.github.com/users/MystPi/repos').then(res => res.json());

  const prompt = new CommandPrompt();

  await prompt.write('cd profile');
  prompt.dir = '~/profile';

  prompt.newLine();
  await prompt.write('cat aboutMe.txt');
  prompt.output(mystpi.bio);

  prompt.newLine();
  await prompt.write('view profilePicture.png');
  
  const img = document.createElement('img');
  img.src = mystpi.avatar_url;
  img.width = 100;
  img.height = 100;
  img.alt = 'profile picture';
  document.body.appendChild(img);

  prompt.newLine();
  await prompt.write('tree sites');
  prompt.tree('~/sites', [
    {
      name: 'Home'
    },
    {
      name: 'Blog',
      url: '/blog'
    },
    {
      name: 'GitHub',
      url: 'https://github.com/MystPi'
    },
    {
      name: 'Scratch', url: 'https://scratch.mit.edu/users/NFlex23'
    }
  ]);

  prompt.newLine();
  await prompt.write('cd repos');
  prompt.dir = '~/profile/repos';

  prompt.newLine();
  await prompt.write('ls | progress --to 30');
  prompt.output(`${repos.length}/30\n${Math.round(repos.length / 30 * 100)}%`);

  prompt.newLine();
  await prompt.write('tree');
  prompt.tree('./repos/', repos.map(repo => ({name: repo.name, url: repo.html_url})));

  prompt.newLine();
  await prompt.write('exit');
  prompt.output('logout');
}


main();