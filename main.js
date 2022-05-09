class CommandPrompt {
  constructor({ user = 'mystpi', host = 'laptop', dir = '~/', cursor = '█' }) {
    this.user = user;
    this.host = host;
    this.dir = dir;
    this.cursorStyle = cursor;

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

  async fromArray(arr) {
    for (let i = 0; i < arr.length; i++) {
      let e = arr[i];
      if (e.type == 'write') {
        await this.write(e.text, e.options?.timeout, e.options?.wait);
      } else if (e.type === 'output') {
        this.output(e.text);
      } else if (e.type === 'tree') {
        this.tree(e.dir, e.data);
      } else if (e.type === 'newLine') {
        this.newLine();
      } else if (e.type === 'changeDir') {
        this.dir = e.dir;
      } else if (e.type === 'do') {
        await e.func();
      }
    }
  }
}


async function main() {
  const mystpi = await fetch('https://api.github.com/users/MystPi').then(res => res.json());
  const repos = await fetch('https://api.github.com/users/MystPi/repos').then(res => res.json());

  const prompt = new CommandPrompt();

  const data = [
    {
      type: 'write',
      text: 'cd profile'
    },
    {
      type: 'changeDir',
      dir: '~/profile'
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'cat aboutMe.txt'
    },
    {
      type: 'output',
      text: mystpi.bio
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'view profilePicture.png'
    },
    {
      type: 'do',
      func() {
        const img = document.createElement('img');
        img.src = mystpi.avatar_url;
        img.width = 100;
        img.height = 100;
        img.alt = 'profile picture';
        document.body.appendChild(img);
      }
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'tree sites'
    },
    {
      type: 'tree',
      dir: './sites/',
      data: [
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
          name: 'Scratch',
          url: 'https://scratch.mit.edu/users/NFlex23'
        }
      ]
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'cd repos'
    },
    {
      type: 'changeDir',
      dir: '~/profile/repos'
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'ls | progress --to 50'
    },
    {
      type: 'output',
      text: `${repos.length}/50\n${Math.round(repos.length / 50 * 100)}%`
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'tree'
    },
    {
      type: 'tree',
      dir: './repos/',
      data: repos.map(repo => ({name: repo.name, url: repo.html_url}))
    },
    {
      type: 'newLine'
    },
    {
      type: 'write',
      text: 'exit'
    },
    {
      type: 'output',
      text: 'logout'
    }
  ];

  await prompt.fromArray(data);
}


main();
