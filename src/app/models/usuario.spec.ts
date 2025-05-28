import { Usuario } from './usuario';

describe('Usuario', () => {
  it('should create an instance', () => {
    const usuario = new Usuario();
    expect(usuario).toBeTruthy();
  });
});