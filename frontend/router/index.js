import { createRouter, createWebHashHistory } from 'vue-router';
import { useMainStore } from '@/store';

// Lazy loading of route components
const MTRTest = () => import('../components/advanced-tools/MtrTest.vue');
const PingTest = () => import('../components/advanced-tools/GlobalLatencyTest.vue');
const RuleTest = () => import('../components/advanced-tools/RuleTest.vue');
const DNSResolver = () => import('../components/advanced-tools/DnsResolver.vue');
const CensorshipCheck = () => import('../components/advanced-tools/CensorshipCheck.vue');
const Whois = () => import('../components/advanced-tools/Whois.vue');
const RdapLookup = () => import('../components/advanced-tools/RdapLookup.vue');
const InvisibilityTest = () => import('../components/advanced-tools/InvisibilityTest.vue');
const MacChecker = () => import('../components/advanced-tools/MacChecker.vue');
const BrowserInfo = () => import('../components/advanced-tools/BrowserInfo.vue');
const Checklist = () => import('../components/advanced-tools/SecurityChecklist.vue');
const CliDocs = () => import('../components/advanced-tools/CliDocs.vue');
const DockerDeploy = () => import('../components/advanced-tools/DockerDeploy.vue');
const ServiceStatus = () => import('../components/advanced-tools/ServiceStatus.vue');
const EmptyComponent = () => import('../components/advanced-tools/Empty.vue');

const toolRoutes = [
  ['/pingtest', 'ping-test', PingTest],
  ['/mtrtest', 'mtr-test', MTRTest],
  ['/ruletest', 'rule-test', RuleTest],
  ['/dnsresolver', 'dns-resolver', DNSResolver],
  ['/censorshipcheck', 'censorship-check', CensorshipCheck],
  ['/whois', 'whois', Whois],
  ['/rdap', 'rdap', RdapLookup],
  ['/macchecker', 'mac-checker', MacChecker],
  ['/browserinfo', 'browser-info', BrowserInfo],
  ['/securitychecklist', 'security-checklist', Checklist],
  ['/invisibilitytest', 'invisibility-test', InvisibilityTest],
  ['/cli', 'cli-docs', CliDocs],
  ['/docker', 'docker-deploy', DockerDeploy],
  ['/status', 'service-status', ServiceStatus],
].map(([path, name, component], toolIndex) => ({
  path,
  name,
  component,
  meta: { toolIndex },
}));

const routes = [
  { path: '/', name: 'dashboard', component: EmptyComponent },
  ...toolRoutes,
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.afterEach((to) => {
  const store = useMainStore();
  if (!to.matched.length) {
    if (store.openSheet === 'tools') {
      store.setOpenSheet(null);
    }
    return;
  }

  store.setCurrentPath(to.path, to.meta.toolIndex);

  if (to.path !== '/') {
    store.setOpenSheet('tools');
  } else if (store.openSheet === 'tools') {
    store.setOpenSheet(null);
  }
});


export default router;
