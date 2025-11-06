import tmp from "tmp";

export function tmpFile(options?: tmp.Options & tmp.FileOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    tmp.file(options ?? {}, (err, path, _fd, _cleanup) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}

export function tmpDir(options?: tmp.Options & tmp.DirOptions): Promise<string> {
  return new Promise((resolve, reject) => {
    tmp.dir(options ?? {}, (err, path, _cleanup) => {
      if (err) return reject(err);
      resolve(path);
    });
  });
}
