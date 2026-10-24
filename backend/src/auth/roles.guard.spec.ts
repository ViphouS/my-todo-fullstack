import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard.js';
import { Role } from '../users/role.enum.js';

describe('RolesGuard', () => {
  const reflector = { getAllAndOverride: vi.fn() };
  const guard = new RolesGuard(reflector as unknown as Reflector);
  const contextFor = (user?: { role: Role }) =>
    ({
      getHandler: () => null,
      getClass: () => null,
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
    }) as any;

  it('lets anyone through a route with no @Roles()', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    expect(guard.canActivate(contextFor())).toBe(true);
  });

  it('lets a matching role through and blocks the others', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.Admin]);
    expect(guard.canActivate(contextFor({ role: Role.Admin }))).toBe(true);
    expect(guard.canActivate(contextFor({ role: Role.User }))).toBe(false);
  });
});
