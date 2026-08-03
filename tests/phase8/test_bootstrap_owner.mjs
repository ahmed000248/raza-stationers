import assert from "node:assert/strict";
import { runAdminBootstrap, validateAdminInput, normalizePakistaniMobile } from "../../scripts/admin/bootstrap-owner.mjs";

process.env.NODE_ENV = "test";

function createMockReadline(inputs = []) {
  let index = 0;
  return {
    async question() {
      if (index >= inputs.length) {
        return "";
      }
      const val = inputs[index];
      index += 1;
      return val;
    },
    next() {
      const val = inputs[index];
      index += 1;
      return val;
    },
    close() {},
  };
}

function createMockDb(initialAdmins = [], options = {}) {
  let admins = [...initialAdmins];
  let users = [...initialAdmins];
  let auditLogs = [];
  let inTransaction = false;

  return {
    admins,
    users,
    auditLogs,
    async query(sql, params = []) {
      const text = typeof sql === "string" ? sql : sql.text;
      
      if (text.startsWith("BEGIN")) {
        inTransaction = true;
        return { rowCount: 0, rows: [] };
      }
      if (text.startsWith("COMMIT")) {
        inTransaction = false;
        return { rowCount: 0, rows: [] };
      }
      if (text.startsWith("ROLLBACK")) {
        inTransaction = false;
        return { rowCount: 0, rows: [] };
      }
      if (text.includes("pg_advisory_xact_lock")) {
        return { rowCount: 0, rows: [] };
      }

      if (text.includes("SELECT id, name, email, mobile_number, role, is_active")) {
        const activeAdmins = users.filter((u) => ["owner", "admin"].includes(u.role) && u.is_active);
        return { rowCount: activeAdmins.length, rows: activeAdmins };
      }

      if (text.includes("SELECT id, role, email, mobile_number, supabase_auth_id FROM public.users WHERE email = $1")) {
        const email = params[0];
        const mobile = params[1];
        const supabaseAuthId = params[3];
        const matches = users.filter(
          (u) => u.email?.toLowerCase() === email?.toLowerCase() || u.mobile_number === mobile || u.supabase_auth_id === supabaseAuthId
        );
        return { rowCount: matches.length, rows: matches };
      }

      if (text.startsWith("INSERT INTO public.users")) {
        if (options.failInsert || options.failUpdate) {
          throw new Error("Simulated DB Update Failure");
        }
        const role = text.includes("'admin'::public.user_role") ? "admin" : "owner";
        const newUser = {
          id: params[0],
          mobile_number: params[1],
          email: params[2],
          name: params[3],
          role,
          is_active: true,
          supabase_auth_id: params[4] || params[0],
        };
        users.push(newUser);
        return { rowCount: 1, rows: [newUser] };
      }

      if (text.startsWith("UPDATE public.users SET supabase_auth_id")) {
        if (options.failUpdate) {
          throw new Error("Simulated DB Update Failure");
        }
        const userId = params[4];
        const u = users.find((item) => item.id === userId);
        if (u) {
          u.supabase_auth_id = params[0];
          u.email = params[1];
          u.mobile_number = params[2];
          u.name = params[3];
          u.is_active = true;
        }
        return { rowCount: 1, rows: [] };
      }

      if (text.startsWith("UPDATE public.users SET is_active = false")) {
        const userId = params[0];
        const u = users.find((item) => item.id === userId);
        if (u) {
          u.is_active = false;
        }
        return { rowCount: 1, rows: [] };
      }

      if (text.startsWith("INSERT INTO public.audit_logs")) {
        auditLogs.push({ id: params[0], actor_id: params[1], action: params[2] });
        return { rowCount: 1, rows: [] };
      }

      return { rowCount: 0, rows: [] };
    },
  };
}

function createMockSupabase(users = [], options = {}) {
  let authUsers = [...users];
  let deletedUserIds = [];
  let updatedPasswords = [];

  return {
    authUsers,
    deletedUserIds,
    updatedPasswords,
    auth: {
      admin: {
        async listUsers({ page = 1, perPage = 100 } = {}) {
          return { data: { users: authUsers }, error: null };
        },
        async createUser({ email, password, email_confirm, user_metadata }) {
          if (options.failCreate) {
            return { data: { user: null }, error: new Error("Simulated Supabase Create Error") };
          }
          const newUser = {
            id: `sb-user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            email,
            user_metadata,
          };
          authUsers.push(newUser);
          return { data: { user: newUser }, error: null };
        },
        async updateUserById(userId, updateOptions) {
          if (options.failUpdateUser) {
            return { data: { user: null }, error: new Error("Simulated Supabase updateUserById failure") };
          }
          updatedPasswords.push({ userId, options: updateOptions });
          return { data: { user: { id: userId } }, error: null };
        },
        async deleteUser(id) {
          deletedUserIds.push(id);
          authUsers = authUsers.filter((u) => u.id !== id);
          return { data: {}, error: null };
        },
      },
    },
  };
}

function createMockLogger() {
  const logs = [];
  return {
    logs,
    log(...args) {
      logs.push(args.join(" "));
    },
    error(...args) {
      logs.push(args.join(" "));
    },
  };
}

async function runTests() {
  console.log("=== RUNNING BOOTSTRAP OWNER UNIT TESTS ===");

  // Scenario 0: Pakistani Mobile Normalization
  assert.equal(normalizePakistaniMobile("03105008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("+923105008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("923105008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("0310-5008398"), "03105008398");
  assert.equal(normalizePakistaniMobile("invalid"), null);
  console.log("✔ Scenario 0: Pakistani Mobile Normalization passed.");

  // Scenario 1: No existing admin -> confirm creation
  {
    const db = createMockDb([]);
    const supabase = createMockSupabase([]);
    const rl = createMockReadline(["yes"]);
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "newadmin@example.com",
      RAZA_OWNER_NAME: "New Admin",
      RAZA_OWNER_MOBILE: "03101234567",
      RAZA_OWNER_INITIAL_PASSWORD: "SuperSecretPassword123!",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "created");
    assert.equal(res.code, 0);
    assert.equal(db.users.length, 1);
    assert.equal(db.users[0].email, "newadmin@example.com");
    assert.equal(db.users[0].role, "owner");
    console.log("✔ Scenario 1: No existing admin -> confirm creation passed.");
  }

  // Scenario 2: No existing admin -> cancel
  {
    const db = createMockDb([]);
    const supabase = createMockSupabase([]);
    const rl = createMockReadline(["no"]);
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "newadmin@example.com",
      RAZA_OWNER_NAME: "New Admin",
      RAZA_OWNER_MOBILE: "03101234567",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "cancelled");
    assert.equal(res.code, 0);
    assert.equal(db.users.length, 0);
    console.log("✔ Scenario 2: No existing admin -> cancel passed.");
  }

  // Scenario 3: Existing admin -> Option 1: add a second admin (different email)
  {
    const existingAdmin = {
      id: "admin-1",
      name: "First Admin",
      email: "firstadmin@example.com",
      mobile_number: "03001111111",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([]);
    const rl = createMockReadline(["1", "yes"]);
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "secondadmin@example.com",
      RAZA_OWNER_NAME: "Second Admin",
      RAZA_OWNER_MOBILE: "03002222222",
      RAZA_OWNER_INITIAL_PASSWORD: "SuperSecretPassword123!",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "second_admin_added");
    assert.equal(res.code, 0);
    assert.equal(db.users.length, 2);
    assert.equal(db.users[0].role, "owner");
    assert.equal(db.users[1].role, "admin");
    console.log("✔ Scenario 3: Existing admin -> add second admin passed.");
  }

  // Scenario 4: Existing admin -> Option 2: replace first admin (different email)
  {
    const existingAdmin = {
      id: "admin-1",
      name: "First Admin",
      email: "firstadmin@example.com",
      mobile_number: "03001111111",
      role: "owner",
      is_active: true,
      created_at: "2026-01-01T00:00:00Z",
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([{ id: "sb-1", email: "firstadmin@example.com" }]);
    const rl = createMockReadline(["2", "REPLACE"]);
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "replacement@example.com",
      RAZA_OWNER_NAME: "Replacement Admin",
      RAZA_OWNER_MOBILE: "03003333333",
      RAZA_OWNER_INITIAL_PASSWORD: "SuperSecretPassword123!",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "replaced");
    assert.equal(res.code, 0);
    assert.equal(db.users.find((u) => u.id === "admin-1").is_active, false);
    assert.equal(db.users.find((u) => u.email === "replacement@example.com").role, "owner");
    console.log("✔ Scenario 4: Existing admin -> replace first admin passed.");
  }

  // Scenario 5: Existing admin -> Option 3: cancel
  {
    const existingAdmin = {
      id: "admin-1",
      name: "First Admin",
      email: "firstadmin@example.com",
      mobile_number: "03001111111",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([]);
    const rl = createMockReadline(["3"]);
    const logger = createMockLogger();

    const res = await runAdminBootstrap({ db, supabase, rl, logger });
    assert.equal(res.status, "cancelled");
    assert.equal(res.code, 0);
    assert.equal(db.users[0].role, "owner");
    console.log("✔ Scenario 5: Existing admin -> cancel passed.");
  }

  // Scenario 6: Invalid menu input -> prompts again until valid option selected
  {
    const existingAdmin = {
      id: "admin-1",
      name: "First Admin",
      email: "firstadmin@example.com",
      mobile_number: "03001111111",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([]);
    const rl = createMockReadline(["invalid_option", "99", "3"]);
    const logger = createMockLogger();

    const res = await runAdminBootstrap({ db, supabase, rl, logger });
    assert.equal(res.status, "cancelled");
    assert.equal(res.code, 0);
    console.log("✔ Scenario 6: Invalid menu input -> re-prompts passed.");
  }

  // Scenario 7: Option 1 + same active-admin email opens nested menu & keeps password
  {
    const existingAdmin = {
      id: "admin-1",
      name: "Ahmed Raza",
      email: "ahmedraa0007@gmail.com",
      mobile_number: "03105008398",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([{ id: "sb-ahmed", email: "ahmedraa0007@gmail.com" }]);
    const rl = createMockReadline(["1", "1"]); // Option 1 (Add second admin), then Option 1 in nested menu (Keep password)
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "ahmedraa0007@gmail.com",
      RAZA_OWNER_NAME: "Ahmed Raza",
      RAZA_OWNER_MOBILE: "03105008398",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "existing_admin_managed");
    assert.equal(res.action, "keep");
    assert.equal(supabase.updatedPasswords.length, 0, "Keep password must perform no updateUserById call");
    assert.equal(db.users.length, 1, "No duplicate admin created");
    assert.equal(db.users[0].is_active, true, "Database user remains active");
    assert.equal(db.users[0].role, "owner", "Database user role remains owner");
    const logText = logger.logs.join("\n");
    assert.equal(logText.includes("The Supabase Auth identity already exists."), true);
    console.log("✔ Scenario 7: Option 1 + same active-admin email opens nested menu & keeps password passed.");
  }

  // Scenario 8: Option 2 + same active-admin email opens nested menu & keeps password
  {
    const existingAdmin = {
      id: "admin-1",
      name: "Ahmed Raza",
      email: "ahmedraa0007@gmail.com",
      mobile_number: "03105008398",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([{ id: "sb-ahmed", email: "ahmedraa0007@gmail.com" }]);
    const rl = createMockReadline(["2", "1"]); // Option 2 (Replace admin), then Option 1 in nested menu (Keep password)
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "ahmedraa0007@gmail.com",
      RAZA_OWNER_NAME: "Ahmed Raza",
      RAZA_OWNER_MOBILE: "03105008398",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "existing_admin_managed");
    assert.equal(res.action, "keep");
    assert.equal(supabase.updatedPasswords.length, 0);
    assert.equal(db.users.length, 1);
    assert.equal(db.users[0].is_active, true);
    console.log("✔ Scenario 8: Option 2 + same active-admin email opens nested menu & keeps password passed.");
  }

  // Scenario 9: Reset occurs only after exact RESET PASSWORD confirmation
  {
    const existingAdmin = {
      id: "admin-1",
      name: "Ahmed Raza",
      email: "ahmedraa0007@gmail.com",
      mobile_number: "03105008398",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([{ id: "sb-ahmed", email: "ahmedraa0007@gmail.com", user_metadata: { custom: "meta" } }]);
    const rl = createMockReadline(["1", "2", "RESET PASSWORD"]); // Option 1 -> Reset password -> exact confirmation
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "ahmedraa0007@gmail.com",
      RAZA_OWNER_NAME: "Ahmed Raza",
      RAZA_OWNER_MOBILE: "03105008398",
      RAZA_OWNER_INITIAL_PASSWORD: "NewSecurePassword123!",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "existing_admin_managed");
    assert.equal(res.action, "reset");
    assert.equal(supabase.updatedPasswords.length, 1);
    assert.equal(supabase.updatedPasswords[0].userId, "sb-ahmed");
    assert.equal(supabase.updatedPasswords[0].options.password, "NewSecurePassword123!");
    assert.equal(supabase.updatedPasswords[0].options.email_confirm, true);
    assert.equal(supabase.updatedPasswords[0].options.user_metadata.custom, "meta", "Metadata merged");
    assert.equal(supabase.updatedPasswords[0].options.user_metadata.name, "Ahmed Raza", "Metadata updated with name");
    assert.equal(db.users.length, 1);
    assert.equal(db.users[0].is_active, true);
    console.log("✔ Scenario 9: Reset occurs only after exact RESET PASSWORD confirmation passed.");
  }

  // Scenario 10: Incorrect confirmation performs no Auth/database write
  {
    const existingAdmin = {
      id: "admin-1",
      name: "Ahmed Raza",
      email: "ahmedraa0007@gmail.com",
      mobile_number: "03105008398",
      role: "owner",
      is_active: true,
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([{ id: "sb-ahmed", email: "ahmedraa0007@gmail.com" }]);
    const rl = createMockReadline(["1", "2", "wrong_confirmation"]);
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "ahmedraa0007@gmail.com",
      RAZA_OWNER_NAME: "Ahmed Raza",
      RAZA_OWNER_MOBILE: "03105008398",
      RAZA_OWNER_INITIAL_PASSWORD: "NewSecurePassword123!",
    };

    const res = await runAdminBootstrap({ db, supabase, rl, env, logger });
    assert.equal(res.status, "cancelled");
    assert.equal(supabase.updatedPasswords.length, 0, "No updateUserById call on incorrect confirmation");
    assert.equal(db.auditLogs.length, 0, "No audit log write on cancelled password reset");
    console.log("✔ Scenario 10: Incorrect confirmation performs no Auth/database write passed.");
  }

  // Scenario 11: updateUserById failure leaves role and linkage unchanged
  {
    const existingAdmin = {
      id: "admin-1",
      name: "Ahmed Raza",
      email: "ahmedraa0007@gmail.com",
      mobile_number: "03105008398",
      role: "owner",
      is_active: true,
      supabase_auth_id: "sb-ahmed",
    };
    const db = createMockDb([existingAdmin]);
    const supabase = createMockSupabase([{ id: "sb-ahmed", email: "ahmedraa0007@gmail.com" }], { failUpdateUser: true });
    const rl = createMockReadline(["1", "2", "RESET PASSWORD"]);
    const logger = createMockLogger();
    const env = {
      RAZA_OWNER_EMAIL: "ahmedraa0007@gmail.com",
      RAZA_OWNER_NAME: "Ahmed Raza",
      RAZA_OWNER_MOBILE: "03105008398",
      RAZA_OWNER_INITIAL_PASSWORD: "NewSecurePassword123!",
    };

    await assert.rejects(async () => {
      await runAdminBootstrap({ db, supabase, rl, env, logger });
    }, /Simulated Supabase updateUserById failure/);

    assert.equal(db.users[0].role, "owner", "Role unchanged on updateUserById failure");
    assert.equal(db.users[0].supabase_auth_id, "sb-ahmed", "Linkage unchanged on updateUserById failure");
    assert.equal(db.users[0].is_active, true, "IsActive unchanged on updateUserById failure");
    console.log("✔ Scenario 11: updateUserById failure leaves role and linkage unchanged passed.");
  }

  // Scenario 12: Secrets never appear in logs
  {
    const db = createMockDb([]);
    const supabase = createMockSupabase([]);
    const rl = createMockReadline(["yes"]);
    const logger = createMockLogger();
    const secretPassword = "SuperSecretPassword123!";
    const env = {
      RAZA_OWNER_EMAIL: "logtest@example.com",
      RAZA_OWNER_NAME: "Log Test",
      RAZA_OWNER_MOBILE: "03108888888",
      RAZA_OWNER_INITIAL_PASSWORD: secretPassword,
    };

    await runAdminBootstrap({ db, supabase, rl, env, logger });
    const fullLogText = logger.logs.join("\n");
    assert.equal(fullLogText.includes(secretPassword), false, "Password appeared in logs!");
    console.log("✔ Scenario 12: Secrets never appear in logs passed.");
  }

  // Scenario 13: Interactive prompt for missing URLs & environment variables
  {
    const { ensureEnvironmentVariables } = await import("../../scripts/admin/bootstrap-owner.mjs");
    const rl = createMockReadline([
      "postgres://postgres:pass@localhost:5432/postgres",
      "https://test.supabase.co",
      "test-service-key",
      "test@example.com",
      "Test User",
      "03101234567",
    ]);
    const logger = createMockLogger();
    const mockEnv = {};

    await ensureEnvironmentVariables(rl, mockEnv, logger);
    assert.equal(mockEnv.DATABASE_URL, "postgres://postgres:pass@localhost:5432/postgres");
    assert.equal(mockEnv.SUPABASE_URL, "https://test.supabase.co");
    assert.equal(mockEnv.SUPABASE_SERVICE_ROLE_KEY, "test-service-key");
    assert.equal(mockEnv.RAZA_OWNER_EMAIL, "test@example.com");
    assert.equal(mockEnv.RAZA_OWNER_NAME, "Test User");
    assert.equal(mockEnv.RAZA_OWNER_MOBILE, "03101234567");
    console.log("✔ Scenario 13: Interactive prompt for missing URLs/env vars passed.");
  }

  // Scenario 14: Production Project Ref Guard validation
  {
    const { validateProductionProject } = await import("../../scripts/admin/bootstrap-owner.mjs");
    assert.throws(
      () => validateProductionProject({ NODE_ENV: "production", SUPABASE_URL: "https://wrongref.supabase.co" }),
      /Target SUPABASE_URL does not match expected production project reference/
    );
    assert.equal(
      validateProductionProject({ NODE_ENV: "production", SUPABASE_URL: "https://pqlmgqzpjjllhgalyhwz.supabase.co" }),
      true
    );
    console.log("✔ Scenario 14: Production Project Ref Guard validation passed.");
  }

  console.log("All 15 Admin Bootstrap Unit Tests Passed Successfully!");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
