---
title: "KubeVirtBMC"
---

![KubeVirtBMC](/images/kubevirtbmc_banner_transparent.svg)

## Why KubeVirtBMC?

Bare-metal provisioning tools like [Metal3](https://metal3.io/),
[Tinkerbell](https://tinkerbell.org/), and
[Seeder](https://github.com/harvester/seeder) rely on
[IPMI](https://www.intel.la/content/dam/www/public/us/en/documents/specification-updates/ipmi-intelligent-platform-mgt-interface-spec-2nd-gen-v2-0-spec-update.pdf)
and [Redfish](https://www.dmtf.org/standards/redfish) to manage server power
state, boot devices, and firmware. [KubeVirt](https://kubevirt.io/) virtual
machines have none of these interfaces out of the box, making them invisible to
existing infrastructure automation.

KubeVirtBMC fills that gap. It is a [Kubernetes
operator](https://kubernetes.io/docs/concepts/extend-kubernetes/operator/) that
creates a virtual BMC (Baseboard Management Controller) for each KubeVirt VM,
exposing standard IPMI and Redfish endpoints that map directly to
Kubernetes-native operations. The result: your VMs become first-class citizens
in any bare-metal provisioning pipeline.

---

## Features

- **IPMI interface** -- Power on, power off, reset, and boot device selection
  through standard `ipmitool` commands
- **Redfish API** -- RESTful server management following the DMTF Redfish
  specification
- **Redfish Virtual Media** -- Mount ISO images remotely for OS installation and
  recovery workflows
- **Kubernetes-native** -- Runs as a controller with CRDs; each VirtualMachine
  gets a corresponding VirtualBMC resource
- **Provisioning-ready** -- Works with Tinkerbell, Metal3, Seeder, and any
  tooling that speaks IPMI or Redfish

---

## How It Works

1. Deploy KubeVirtBMC via the [Helm chart](https://github.com/kubevirtbmc/chart)
2. The operator watches for `VirtualMachineBMC` resources
3. For each `VirtualMachineBMC` resource`, a pair of pod and service is created
   with dedicated IPMI and Redfish endpoints
4. Provisioning tools and operators interact with VMs through these standard
   interfaces

---

## Get Involved

KubeVirtBMC is open source under the [Apache 2.0
License](https://github.com/kubevirtbmc/kubevirtbmc/blob/main/LICENSE) and
welcomes contributions.

| Repository | Description |
| --- | --- |
| [kubevirtbmc](https://github.com/kubevirtbmc/kubevirtbmc) | Main operator source code |
| [chart](https://github.com/kubevirtbmc/chart) | Helm chart for deployment |
| [docs](https://github.com/kubevirtbmc/docs) | Project documentation source |

Read the full documentation at
[docs.kubevirtbmc.io](https://docs.kubevirtbmc.io) to get started.
