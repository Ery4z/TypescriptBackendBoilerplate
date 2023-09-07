import { hashWithSalt, compareHash } from "../../src/tools/crypto";

describe("Crypto", () => {
  const password = "password";
  let hash;

  it("should hash a password", async () => {
    hash = await hashWithSalt(password);

    expect(hash).toBeDefined();
    expect(hash).not.toBeNull();
    expect(hash).not.toBe(password);
  });

  it("should compare a password to a hash", async () => {
    const result = await compareHash(password, hash);
    expect(result).toBe(true);
  });
});
