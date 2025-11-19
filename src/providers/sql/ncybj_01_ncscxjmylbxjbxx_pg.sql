CREATE TABLE IF NOT EXISTS ncybj_01_ncscxjmylbxjbxx_copy1 (
  sndcbjg VARCHAR(255),
  cccbnd SMALLINT,
  cbsf VARCHAR(255),
  grbm VARCHAR(255),
  xm VARCHAR(255) NOT NULL,
  cbzt VARCHAR(255),
  cbnd SMALLINT,
  jfzje NUMERIC(12, 2),
  grjfje NUMERIC(12, 2),
  sfzh VARCHAR(18) NOT NULL,
  swap_data_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sfzh, cbnd)
);
CREATE INDEX IF NOT EXISTS idx_sfzh_time ON ncybj_01_ncscxjmylbxjbxx_copy1 (sfzh, swap_data_time);
CREATE INDEX IF NOT EXISTS idx_xm ON ncybj_01_ncscxjmylbxjbxx_copy1 (xm);

COMMENT ON TABLE ncybj_01_ncscxjmylbxjbxx_copy1 IS '南充市城乡居民医疗保险参保基本信息';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.sndcbjg IS '上年参保机构';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.cccbnd IS '初次参保年度';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.cbsf IS '参保身份';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.grbm IS '个人编码';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.xm IS '姓名';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.cbzt IS '当前参保状态';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.cbnd IS '当前缴费年度';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.jfzje IS '当前缴费金额';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.grjfje IS '当前缴费金额';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.sfzh IS '身份证件号码';
COMMENT ON COLUMN ncybj_01_ncscxjmylbxjbxx_copy1.swap_data_time IS '更新时间';

-- INSERT INTO ncybj_01_ncscxjmylbxjbxx_copy1 (
--   sndcbjg, cccbnd, cbsf, grbm, xm, cbzt, cbnd, jfzje, grjfje, sfzh, swap_data_time
-- ) VALUES
-- ('琳琅居委会', 2017, '居民', '511381198706055555', '张三', '正常参保', 2022, 320.00, 320.00, '511381198706055555', '2023-08-03 10:33:53'),
-- ('学堂沟村', 2017, '居民', '512926194806111111', '李四', '正常参保', 2022, 320.00, 320.00, '512926194806111111', '2023-08-03 10:33:53'),
-- ('楼子寺村', 2017, '居民', '512922195309199999', '王五', '正常参保', 2022, 320.00, 320.00, '512922195309199999', '2023-08-03 10:33:53');